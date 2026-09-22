import { type FieldSchemaResponse, type ScalarFieldSchemaResponse } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { type CatalogVariableField, getCatalogVariableValue } from './catalog-variable-field'

export function isCatalogObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function toCatalogScalarField(field: ScalarFieldSchemaResponse, key = field.key): CatalogVariableField {
  return {
    key,
    label: field.label,
    type: field.type,
    description: field.description ?? undefined,
    required: field.required,
    sensitive: field.sensitive,
    defaultValue: field.defaultValue ?? undefined,
    allowedValues: field.constraints.allowedValues ?? undefined,
    pattern: field.constraints.pattern ?? undefined,
    minLength: field.constraints.minLength ?? undefined,
    maxLength: field.constraints.maxLength ?? undefined,
    min: field.constraints.min ?? undefined,
    max: field.constraints.max ?? undefined,
  }
}

export function toCatalogConfigurationValue(field: Pick<FieldSchemaResponse, 'type'>, value: unknown): unknown {
  if (field.type !== 'number') return value
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined
  if (typeof value !== 'string') return undefined
  if (value.trim() === '') return ''
  const number = Number(value)
  return Number.isFinite(number) ? number : value
}

export function applyCatalogConfigurationDefaults(
  fields: FieldSchemaResponse[],
  values: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...values }
  fields.forEach((field) => {
    const value = values[field.key]
    const resolved = match(field)
      .with({ type: 'object' }, (object) =>
        value === undefined || isCatalogObject(value)
          ? applyCatalogConfigurationDefaults(object.fields, value ?? {})
          : value
      )
      .with({ type: 'array' }, (array) => {
        if (!Array.isArray(value) || array.items.type !== 'object') return value
        const item = array.items
        return value.map((row, index) =>
          isCatalogObject(row)
            ? applyCatalogConfigurationDefaults(
                array.itemFields?.length === value.length ? array.itemFields[index] : item.fields,
                row
              )
            : row
        )
      })
      .otherwise((scalar) =>
        value === undefined ? toCatalogConfigurationValue(scalar, getCatalogVariableValue(scalar, undefined)) : value
      )
    if (resolved !== undefined) result[field.key] = resolved
  })
  return result
}

function preservesEmptyString(field: FieldSchemaResponse | undefined): boolean {
  if (field?.type !== 'string' || !field.required || (field.constraints.minLength ?? 0) > 0) return false
  if (field.constraints.allowedValues && !field.constraints.allowedValues.includes('')) return false
  try {
    return !field.constraints.pattern || new RegExp(field.constraints.pattern).test('')
  } catch {
    return false
  }
}

/** Keep array indices stable and preserve required empty strings allowed by the schema (such as valueless taints). */
export function omitEmptyCatalogValues(
  values: Record<string, unknown>,
  fields: FieldSchemaResponse[] = []
): Record<string, unknown> {
  const clean = (value: unknown, field?: FieldSchemaResponse): unknown => {
    if (Array.isArray(value))
      return value.map((row, index) => {
        if (field?.type === 'array' && field.items.type === 'object' && isCatalogObject(row)) {
          return omitEmptyCatalogValues(
            row,
            field.itemFields?.length === value.length ? field.itemFields[index] : field.items.fields
          )
        }
        return clean(row)
      })
    if (isCatalogObject(value)) return omitEmptyCatalogValues(value, field?.type === 'object' ? field.fields : [])
    return value
  }
  return Object.fromEntries(
    Object.entries(values)
      .filter(
        ([key, value]) =>
          value !== undefined && (value !== '' || preservesEmptyString(fields.find((field) => field.key === key)))
      )
      .map(([key, value]) => [
        key,
        clean(
          value,
          fields.find((field) => field.key === key)
        ),
      ])
  )
}
