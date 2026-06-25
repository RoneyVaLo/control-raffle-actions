'use client'

import { useState, useEffect } from 'react'
import { Button } from './button'
import { Input } from './input'
import { Label } from './label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './dialog'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './select'
import type { FormDialogProps } from '@/types/form-dialog'

export function FormDialog({
  open,
  onOpenChange,
  title,
  fields,
  initialValues = {},
  onSubmit,
  submitLabel = 'Guardar',
}: FormDialogProps) {
  const [values, setValues] = useState<Record<string, string>>(initialValues)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setValues(initialValues)
      setErrors({})
    }
  }, [open, initialValues])

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {}
    fields.forEach((field) => {
      if (field.required && !values[field.name]?.trim()) {
        newErrors[field.name] = `${field.label} es requerido`
      }
    })
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setLoading(true)
    try {
      await onSubmit(values)
      onOpenChange(false)
    } catch {
      setErrors({ _form: 'Error al guardar' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Complete los campos para continuar.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {fields.map((field) => (
            <div key={field.name}>
              <Label htmlFor={field.name}>{field.label}</Label>
              {field.type === 'select' && field.options ? (
                <Select
                  value={values[field.name] || ''}
                  onValueChange={(value) =>
                    setValues((prev) => ({ ...prev, [field.name]: value }))
                  }
                >
                  <SelectTrigger id={field.name} className="mt-1">
                    <SelectValue placeholder={field.placeholder || `Seleccionar ${field.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={field.name}
                  type={field.type === 'number' ? 'number' : 'text'}
                  placeholder={field.placeholder}
                  value={values[field.name] || ''}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                  }
                  className="mt-1"
                  error={errors[field.name]}
                />
              )}
            </div>
          ))}
          {errors._form && <p className="text-sm text-red-500">{errors._form}</p>}
        </div>
        <DialogFooter className="mt-4 gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
