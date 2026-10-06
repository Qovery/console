import { type FieldSchemaResponse } from 'qovery-typescript-axios'
import { isPlatformArrayField, isPlatformObjectField } from '../platform-configuration/platform-configuration-utils'

type SearchableText = { label: string; description?: string | null }

export function normalizeProfileSearch(search?: string) {
  return search?.trim().toLocaleLowerCase() ?? ''
}

export function matchesProfileSearch({ label, description }: SearchableText, query: string) {
  return (
    !query || label.toLocaleLowerCase().includes(query) || Boolean(description?.toLocaleLowerCase().includes(query))
  )
}

function getChildFields(field: FieldSchemaResponse): FieldSchemaResponse[] {
  if (isPlatformObjectField(field)) return field.fields
  if (isPlatformArrayField(field) && field.items.type === 'object') return field.items.fields
  return []
}

export function fieldMatchesProfileSearch(field: FieldSchemaResponse, query: string): boolean {
  return (
    matchesProfileSearch(field, query) || getChildFields(field).some((child) => fieldMatchesProfileSearch(child, query))
  )
}

// Keeps matching fields; an object matched through its children only shows those children.
export function filterFieldsByProfileSearch(fields: FieldSchemaResponse[], query: string): FieldSchemaResponse[] {
  if (!query) return fields

  return fields.flatMap((field) => {
    if (matchesProfileSearch(field, query)) return [field]
    if (isPlatformObjectField(field)) {
      const childFields = filterFieldsByProfileSearch(field.fields, query)
      return childFields.length ? [{ ...field, fields: childFields }] : []
    }
    return fieldMatchesProfileSearch(field, query) ? [field] : []
  })
}
