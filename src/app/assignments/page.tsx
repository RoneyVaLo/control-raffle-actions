'use client'

import { useState, useEffect } from 'react'
import { SearchInput } from '@/components/ui/search-input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { ActionRangeInput } from '@/features/assignments/components/action-range-input'
import { AssignmentPreview } from '@/features/assignments/components/assignment-preview'
import type { Section, Student } from '@/types'

export default function AssignmentsPage() {
  const [sections, setSections] = useState<Section[]>([])
  const [selectedSection, setSelectedSection] = useState('')
  const [students, setStudents] = useState<Student[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [actionNumbers, setActionNumbers] = useState<number[]>([])
  const [assigning, setAssigning] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetch('/api/sections')
      .then((r) => r.json())
      .then(setSections)
  }, [])

  useEffect(() => {
    if (!selectedSection && !searchQuery) {
      setStudents([])
      return
    }
    const params = new URLSearchParams()
    if (selectedSection) params.set('section_id', selectedSection)
    if (searchQuery) params.set('q', searchQuery)
    fetch(`/api/students?${params}`)
      .then((r) => r.json())
      .then(setStudents)
  }, [selectedSection, searchQuery])

  const handleAssign = async () => {
    if (!selectedStudent || actionNumbers.length === 0) return
    setAssigning(true)
    setMessage(null)
    try {
      const res = await fetch('/api/raffle-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: selectedStudent.id,
          action_numbers: actionNumbers,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Error al asignar' })
      } else {
        setMessage({ type: 'success', text: `${data.length} accion${data.length !== 1 ? 'es' : ''} asignada${data.length !== 1 ? 's' : ''} exitosamente` })
        setActionNumbers([])
      }
    } catch {
      setMessage({ type: 'error', text: 'Error de conexión' })
    } finally {
      setAssigning(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Asignaciones</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Filtrar Estudiante</h2>

          <div className="w-full sm:w-64">
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por sección" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas las secciones</SelectItem>
                {sections.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-80">
            <SearchInput
              placeholder="Buscar estudiante por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-1 max-h-64 overflow-y-auto">
            {students.length === 0 && (selectedSection || searchQuery) && (
              <p className="text-sm text-gray-500 py-4 text-center">No se encontraron estudiantes</p>
            )}
            {students.map((s) => (
              <button
                key={s.id}
                className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${
                  selectedStudent?.id === s.id
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
                onClick={() => {
                  setSelectedStudent(s)
                  setActionNumbers([])
                }}
              >
                {s.full_name}
              </button>
            ))}
          </div>

          {selectedStudent && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Asignar Acciones</h2>
              <ActionRangeInput onChange={setActionNumbers} />
            </div>
          )}
        </div>

        <div>
          {selectedStudent && actionNumbers.length > 0 && (
            <AssignmentPreview
              studentName={selectedStudent.full_name}
              actionNumbers={actionNumbers}
              onConfirm={handleAssign}
              loading={assigning}
            />
          )}

          {message && (
            <div
              className={`mt-4 rounded-lg p-3 text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
