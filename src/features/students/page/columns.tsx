import type { Column } from '@/components/ui/data-table'
import type { StudentWithSection } from '@/types'

export function getStudentColumns(
  actionCounts: Record<string, number>
): Column<StudentWithSection>[] {
  return [
    { key: 'full_name', header: 'Nombre' },
    {
      key: 'section_name',
      header: 'Sección',
      render: (item) => item.section_name || '-',
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
