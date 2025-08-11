import { useCallback, useMemo, useState } from 'react'
import { Field, FieldOption, FieldType, FormModel } from '../types'

function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`
}

export function useFormBuilderState(initial?: Partial<FormModel>) {
  const [title, setTitle] = useState(initial?.title ?? 'Untitled Form')
  const [fields, setFields] = useState<Field[]>(initial?.fields ?? [])

  const addField = useCallback((type: FieldType) => {
    const base: Field = {
      id: generateId('field'),
      type,
      label: 'Untitled',
      required: false,
    }
    if (type === 'multiple_choice' || type === 'checkbox') {
      base.options = [
        { id: generateId('opt'), label: 'Option 1' },
        { id: generateId('opt'), label: 'Option 2' },
      ]
    }
    if (type === 'rating') {
      base.minRating = 1
      base.maxRating = 5
    }
    setFields(prev => [...prev, base])
  }, [])

  const updateField = useCallback((id: string, updater: (prev: Field) => Field) => {
    setFields(prev => prev.map(f => (f.id === id ? updater(f) : f)))
  }, [])

  const removeField = useCallback((id: string) => {
    setFields(prev => prev.filter(f => f.id !== id))
  }, [])

  const moveField = useCallback((from: number, to: number) => {
    setFields(prev => {
      const copy = [...prev]
      const [item] = copy.splice(from, 1)
      copy.splice(to, 0, item)
      return copy
    })
  }, [])

  const addOption = useCallback((fieldId: string) => {
    updateField(fieldId, f => ({
      ...f,
      options: [...(f.options ?? []), { id: generateId('opt'), label: `Option ${(f.options?.length ?? 0) + 1}` }],
    }))
  }, [updateField])

  const updateOption = useCallback((fieldId: string, optId: string, label: string) => {
    updateField(fieldId, f => ({
      ...f,
      options: (f.options ?? []).map(o => (o.id === optId ? { ...o, label } : o)),
    }))
  }, [updateField])

  const removeOption = useCallback((fieldId: string, optId: string) => {
    updateField(fieldId, f => ({
      ...f,
      options: (f.options ?? []).filter(o => o.id !== optId),
    }))
  }, [updateField])

  const form: FormModel = useMemo(() => ({ title, fields }), [title, fields])

  return {
    title,
    setTitle,
    fields,
    addField,
    updateField,
    removeField,
    moveField,
    addOption,
    updateOption,
    removeOption,
    form,
  }
}
