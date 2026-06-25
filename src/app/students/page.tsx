'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DataTable } from '@/components/ui/data-table'
import { FormDialog } from '@/components/ui/form-dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { SearchInput } from '@/components/ui/search-input'
import { Plus, RotateCcw } from 'lucide-react'
import { getStudentColumns } from '@/features/students/page/columns'
import type { Section, StudentWithSection } from '@/types'

function StudentsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [students, setStudents] = useState<StudentWithSection[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [actionCounts, setActionCounts] = useState<Record<string, number>>({})
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<StudentWithSection | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<StudentWithSection | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [sectionFilter, setSectionFilter] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (sectionFilter) params.set('section_id', sectionFilter)
      if (searchQuery) params.set('q', searchQuery)

      const [studentsRes, sectionsRes, actionsRes] = await Promise.all([
        fetch(`/api/students?${params}`),
        fetch('/api/sections'),
        fetch('/api/raffle-actions?pageSize=5000'),
      ])
      const studentsData = await studentsRes.json()
      const sectionsData = await sectionsRes.json()
      const actionsData = await actionsRes.json()
      setStudents(studentsData)
      setSections(sectionsData)

      const counts: Record<string, number> = {}
      actionsData.data?.forEach((a: any) => {
        counts[a.student_id] = (counts[a.student_id] || 0) + 1
      })
      setActionCounts(counts)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [sectionFilter, searchQuery])

  useEffect(() => { fetchData() }, [fetchData])

  const handleCreate = async (values: Record<string, string>) => {
    await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    await fetchData()
  }

  const handleEdit = async (values: Record<string, string>) => {
    if (!editingStudent) return
    await fetch(`/api/students/${editingStudent.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    setEditingStudent(null)
    await fetchData()
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    setDeleting(true)
    try {
      await fetch(`/api/students/${deleteConfirm.id}`, { method: 'DELETE' })
      setDeleteConfirm(null)
      await fetchData()
    } finally {
      setDeleting(false)
    }
  }

  const columns = getStudentColumns(actionCounts)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Estudiantes</h1>
        <Button onClick={() => { setEditingStudent(null); setDialogOpen(true) }}>
          <Plus className="mr-1 h-4 w-4" />
          Nuevo Estudiante
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-64">
          <SearchInput
            placeholder="Buscar por nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={sectionFilter} onValueChange={setSectionFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todas las secciones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas</SelectItem>
              {sections.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {(searchQuery || sectionFilter) && (
          <Button variant="ghost" size="sm" onClick={() => { setSearchQuery(''); setSectionFilter('') }}>
            <RotateCcw className="mr-1 h-3 w-3" />Limpiar
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={students}
        keyExtractor={(s) => s.id}
        loading={loading}
        emptyMessage="No hay estudiantes registrados"
        onRowClick={(student) => router.push(`/students/${student.id}`)}
      />

      <FormDialog
        open={dialogOpen || !!editingStudent}
        onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingStudent(null) }}
        title={editingStudent ? 'Editar Estudiante' : 'Nuevo Estudiante'}
        fields={[
          { name: 'full_name', label: 'Nombre completo', type: 'text', placeholder: 'Nombre del estudiante', required: true },
          { name: 'section_id', label: 'Sección', type: 'select', required: true, options: sections.map((s) => ({ value: s.id, label: s.name })) },
        ]}
        initialValues={editingStudent ? { full_name: editingStudent.full_name, section_id: editingStudent.section_id } : {}}
        onSubmit={editingStudent ? handleEdit : handleCreate}
        submitLabel={editingStudent ? 'Guardar cambios' : 'Crear'}
      />

      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => { if (!open) setDeleteConfirm(null) }}
        title="Eliminar Estudiante"
        description={`¿Estás seguro de eliminar a "${deleteConfirm?.full_name}"? Se eliminarán también todas sus acciones.`}
        onConfirm={handleDelete}
        variant="destructive"
        loading={deleting}
      />
    </div>
  )
}

export default function StudentsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Cargando...</div>}>
      <StudentsContent />
    </Suspense>
  )
}
