export type FieldType = 'text' | 'multiple_choice' | 'checkbox' | 'rating'

export type FieldOption = {
  id: string
  label: string
}

export type Field = {
  id: string
  type: FieldType
  label: string
  required?: boolean
  placeholder?: string
  options?: FieldOption[]
  minRating?: number
  maxRating?: number
}

export type FormModel = {
  id?: string
  title: string
  fields: Field[]
  createdAt?: number
  updatedAt?: number
}

export type AnalyticsFieldDistribution = {
  fieldId: string
  type: FieldType
  label: string
  counts?: Record<string, number>
  average?: number
  count: number
  recentTexts?: string[]
}

export type AnalyticsData = {
  formId: string
  fields: AnalyticsFieldDistribution[]
  totalResponses: number
}
