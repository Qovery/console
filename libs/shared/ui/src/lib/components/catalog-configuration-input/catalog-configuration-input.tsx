import { type ArrayFieldSchemaResponse, type FieldSchemaResponse } from 'qovery-typescript-axios'
import { useRef } from 'react'
import { match } from 'ts-pattern'
import {
  applyCatalogConfigurationDefaults,
  getCatalogVariableValue,
  isCatalogObject,
  toCatalogConfigurationValue,
  toCatalogScalarField,
} from '@qovery/shared/util-js'
import { Button } from '../button/button'
import { CatalogVariableInput } from '../catalog-variable-input/catalog-variable-input'

export interface CatalogConfigurationInputProps {
  field: FieldSchemaResponse
  value: unknown
  onChange: (value: unknown) => void
  path?: string
  getError?: (path: string) => string | undefined
}

function ObjectInputs({
  fields,
  value,
  onChange,
  path,
  getError,
}: Omit<CatalogConfigurationInputProps, 'field'> & { fields: FieldSchemaResponse[]; path: string }) {
  const values = applyCatalogConfigurationDefaults(fields, isCatalogObject(value) ? value : {})
  return (
    <div className="flex flex-col gap-3">
      {fields.map((field) => (
        <CatalogConfigurationInput
          key={field.key}
          field={field}
          path={`${path}.${field.key}`}
          value={values[field.key]}
          getError={getError}
          onChange={(next) => onChange({ ...values, [field.key]: next })}
        />
      ))}
    </div>
  )
}

function ArrayInput({
  field,
  value,
  onChange,
  path = field.key,
  getError,
}: CatalogConfigurationInputProps & { field: ArrayFieldSchemaResponse }) {
  const rows = Array.isArray(value) ? value : []
  const keys = useRef<number[]>([])
  const nextKey = useRef(0)
  while (keys.current.length < rows.length) keys.current.push(nextKey.current++)
  keys.current.length = rows.length
  const error = getError?.(path)
  const min = field.constraints.minItems ?? 0
  const max = field.constraints.maxItems

  return (
    <fieldset className="min-w-0 border-l border-neutral pl-4">
      <legend className="mb-3 text-sm font-medium">{field.label}</legend>
      {field.description ? <p className="mb-3 text-ssm text-neutral-subtle">{field.description}</p> : null}
      {rows.length === 0 ? <p className="mb-3 text-sm text-neutral-subtle">No items yet.</p> : null}
      <div className="flex flex-col gap-4">
        {rows.map((row, index) => {
          const rowPath = `${path}[${index}]`
          const update = (next: unknown) =>
            onChange(rows.map((value, candidate) => (candidate === index ? next : value)))
          return (
            <fieldset key={keys.current[index]} className="min-w-0 border-t border-neutral pt-3">
              <legend className="text-sm font-medium">{`${field.label} ${index + 1}`}</legend>
              <div className="mb-2 flex justify-end">
                <Button
                  type="button"
                  variant="plain"
                  size="sm"
                  disabled={rows.length <= min}
                  aria-label={`Remove ${field.label} ${index + 1}`}
                  onClick={() => {
                    keys.current.splice(index, 1)
                    onChange(rows.filter((_, candidate) => candidate !== index))
                  }}
                >
                  Remove
                </Button>
              </div>
              {match(field.items)
                .with({ type: 'object' }, (item) => (
                  <>
                    {getError?.(rowPath) ? <p className="mb-2 text-xs text-negative">{getError(rowPath)}</p> : null}
                    <ObjectInputs
                      fields={field.itemFields?.length === rows.length ? field.itemFields[index] : item.fields}
                      path={rowPath}
                      value={row}
                      onChange={update}
                      getError={getError}
                    />
                  </>
                ))
                .otherwise((item) => (
                  <CatalogConfigurationInput
                    field={{
                      ...item,
                      key: rowPath,
                      label: `${field.label} ${index + 1}`,
                      required: true,
                      sensitive: field.sensitive,
                    }}
                    path={rowPath}
                    value={row}
                    onChange={update}
                    getError={getError}
                  />
                ))}
            </fieldset>
          )
        })}
      </div>
      {error ? <p className="mt-2 text-xs text-negative">{error}</p> : null}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3"
        disabled={max != null && rows.length >= max}
        aria-label={`Add item to ${field.label}`}
        onClick={() => {
          const item = field.items
          const initial =
            item.type === 'object'
              ? applyCatalogConfigurationDefaults(item.fields, {})
              : item.type === 'bool'
                ? false
                : ''
          onChange([...rows, initial])
        }}
      >
        Add item
      </Button>
    </fieldset>
  )
}

export function CatalogConfigurationInput({
  field,
  value,
  onChange,
  path = field.key,
  getError,
}: CatalogConfigurationInputProps) {
  return match(field)
    .with({ type: 'array' }, (array) => (
      <ArrayInput field={array} value={value} onChange={onChange} path={path} getError={getError} />
    ))
    .with({ type: 'object' }, (object) => (
      <fieldset className="min-w-0 border-l border-neutral pl-4">
        <legend className="mb-3 text-sm font-medium">{object.label}</legend>
        {object.description ? <p className="mb-3 text-ssm text-neutral-subtle">{object.description}</p> : null}
        <ObjectInputs fields={object.fields} value={value} onChange={onChange} path={path} getError={getError} />
        {getError?.(path) ? <p className="mt-2 text-xs text-negative">{getError(path)}</p> : null}
      </fieldset>
    ))
    .otherwise((scalar) => (
      <CatalogVariableInput
        booleanControl="checkbox"
        inputId={path}
        field={toCatalogScalarField(scalar, path)}
        value={getCatalogVariableValue(scalar, value)}
        error={getError?.(path)}
        onChange={(next) => onChange(toCatalogConfigurationValue(scalar, next))}
      />
    ))
}
