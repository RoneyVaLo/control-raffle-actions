export interface FormField {
  name: string
  label: string
  type: 'text' | 'select' | 'number'
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
}

export interface FormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  fields: FormField[]
  initialValues?: Record<string, string>
  onSubmit: (values: Record<string, string>) => Promise<void>
  submitLabel?: string
}
