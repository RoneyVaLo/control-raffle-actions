'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { SearchInput } from '@/components/ui/search-input'
import { RotateCcw } from 'lucide-react'
import { getStudentColumns } from '@/features/students/page/columns'
import type { Section, StudentWithSection } from '@/types'

function StudentsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [students, setStudents] = useState<StudentWithSection[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [actionCounts, setActionCounts] = useState<Record<string, number>>({})
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

  const columns = getStudentColumns(actionCounts)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Estudiantes</h1>

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
