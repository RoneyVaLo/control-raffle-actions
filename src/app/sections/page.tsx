'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { DataTable } from '@/components/ui/data-table'
import { FormDialog } from '@/components/ui/form-dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { getSectionColumns } from '@/features/sections/page/columns'
import type { Section } from '@/types'

export default function SectionsPage() {
  const router = useRouter()
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [studentCounts, setStudentCounts] = useState<Record<string, number>>({})
  const [actionCounts, setActionCounts] = useState<Record<string, number>>({})
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<Section | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Section | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [sectionsRes, actionsRes] = await Promise.all([
        fetch('/api/sections'),
        fetch('/api/raffle-actions?pageSize=5000'),
      ])
      const sectionsData = await sectionsRes.json()
      const actionsData = await actionsRes.json()
      setSections(sectionsData)

      const counts: Record<string, number> = {}
      sectionsData.forEach((s: Section) => {
        const res = actionsData.data?.filter(
          (a: any) => a.section_id === s.id
        )
        counts[s.id] = res?.length ?? 0
      })
      setActionCounts(counts)

      const sCounts: Record<string, number> = {}
      const studentsRes = await fetch('/api/students')
      const studentsData = await studentsRes.json()
      studentsData.forEach((s: any) => {
        sCounts[s.section_id] = (sCounts[s.section_id] || 0) + 1
      })
      setStudentCounts(sCounts)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleCreate = async (values: Record<string, string>) => {
    await fetch('/api/sections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    await fetchData()
  }

  const handleEdit = async (values: Record<string, string>) => {
    if (!editingSection) return
    await fetch(`/api/sections/${editingSection.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    setEditingSection(null)
    await fetchData()
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    setDeleting(true)
    try {
      await fetch(`/api/sections/${deleteConfirm.id}`, { method: 'DELETE' })
      setDeleteConfirm(null)
      await fetchData()
    } finally {
      setDeleting(false)
    }
  }

  const columns = getSectionColumns(studentCounts, actionCounts)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Secciones</h1>
        <Button onClick={() => { setEditingSection(null); setDialogOpen(true) }}>
          <Plus className="mr-1 h-4 w-4" />
          Nueva Sección
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={sections}
        keyExtractor={(s) => s.id}
        loading={loading}
        emptyMessage="No hay secciones registradas"
        onRowClick={(section) => router.push(`/sections/${section.id}`)}
      />

      <FormDialog
        open={dialogOpen || !!editingSection}
        onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingSection(null) }}
        title={editingSection ? 'Editar Sección' : 'Nueva Sección'}
        fields={[{ name: 'name', label: 'Nombre', type: 'text', placeholder: 'Ej: 7-1', required: true }]}
        initialValues={editingSection ? { name: editingSection.name } : {}}
        onSubmit={editingSection ? handleEdit : handleCreate}
        submitLabel={editingSection ? 'Guardar cambios' : 'Crear'}
      />

      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => { if (!open) setDeleteConfirm(null) }}
        title="Eliminar Sección"
        description={`¿Estás seguro de eliminar la sección "${deleteConfirm?.name}"? Se eliminarán también todos los estudiantes y acciones asociados.`}
        onConfirm={handleDelete}
        variant="destructive"
        loading={deleting}
      />
    </div>
  )
}
