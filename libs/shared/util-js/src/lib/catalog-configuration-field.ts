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

/** Keep array indices stable: empty scalar items must reach validation, not disappear. */
export function omitEmptyCatalogValues(values: Record<string, unknown>): Record<string, unknown> {
  const clean = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(clean)
    if (isCatalogObject(value)) return omitEmptyCatalogValues(value)
    return value
  }
  return Object.fromEntries(
    Object.entries(values)
      .filter(([, value]) => value !== '' && value !== undefined)
      .map(([key, value]) => [key, clean(value)])
  )
}
