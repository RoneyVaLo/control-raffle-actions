import type { Column } from '@/components/ui/data-table'
import type { Section } from '@/types'
import { Badge } from '@/components/ui/badge'

export function getSectionColumns(
  studentCounts: Record<string, number>,
  actionCounts: Record<string, number>
): Column<Section & { student_count?: number; action_count?: number }>[] {
  return [
    { key: 'name', header: 'Sección' },
    {
      key: 'student_count',
      header: 'Estudiantes',
      render: (item) => (
        <Badge variant="default">{studentCounts[item.id] ?? 0}</Badge>
      ),
    },
    {
      key: 'action_count',
      header: 'Acciones',
      render: (item) => (
        <span className="font-medium">{actionCounts[item.id] ?? 0}</span>
      ),
    },
  ]
}
