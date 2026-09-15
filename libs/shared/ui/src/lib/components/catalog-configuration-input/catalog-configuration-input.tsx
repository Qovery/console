import { type ArrayFieldSchemaResponse, type FieldSchemaResponse } from 'qovery-typescript-axios'
import { type ReactNode, useRef, useState } from 'react'
import { match } from 'ts-pattern'
import {
  applyCatalogConfigurationDefaults,
  getCatalogVariableValue,
  isCatalogObject,
  toCatalogConfigurationValue,
  toCatalogScalarField,
} from '@qovery/shared/util-js'
import { Accordion } from '../accordion/accordion'
import { Button } from '../button/button'
import { CatalogVariableInput } from '../catalog-variable-input/catalog-variable-input'
import { CatalogYamlInput } from './catalog-yaml-input'
import { CatalogYamlResourceList } from './catalog-yaml-resource-list'

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

function hasFieldError(
  field: FieldSchemaResponse,
  value: unknown,
  path: string,
  getError: CatalogConfigurationInputProps['getError']
): boolean {
  if (!getError) return false
  if (getError(path)) return true
  if (field.type === 'object') {
    return field.fields.some((child) =>
      hasFieldError(child, isCatalogObject(value) ? value[child.key] : undefined, `${path}.${child.key}`, getError)
    )
  }
  if (field.type === 'array' && Array.isArray(value)) {
    return value.some((row, index) => {
      const rowPath = `${path}[${index}]`
      if (getError?.(rowPath)) return true
      return (
        field.items.type === 'object' &&
        (field.itemFields?.length === value.length ? field.itemFields[index] : field.items.fields).some((child) =>
          hasFieldError(child, isCatalogObject(row) ? row[child.key] : undefined, `${rowPath}.${child.key}`, getError)
        )
      )
    })
  }
  return false
}

function ObjectArrayItem({
  fields,
  value,
  onChange,
  path,
  getError,
  label,
  sensitive,
  initiallyOpen,
  remove,
}: Omit<CatalogConfigurationInputProps, 'field'> & {
  fields: FieldSchemaResponse[]
  path: string
  label: string
  sensitive: boolean
  initiallyOpen: boolean
  remove: ReactNode
}) {
  const [open, setOpen] = useState(initiallyOpen)
  const nameField = fields.find((field) => field.key === 'name' && field.type === 'string' && !field.sensitive)
  const name =
    !sensitive && nameField && isCatalogObject(value) && typeof value.name === 'string' ? value.name.trim() : ''
  const hasError =
    Boolean(getError?.(path)) ||
    fields.some((field) =>
      hasFieldError(field, isCatalogObject(value) ? value[field.key] : undefined, `${path}.${field.key}`, getError)
    )
  return (
    <Accordion.Root
      type="single"
      collapsible
      value={open || hasError ? 'item' : ''}
      onValueChange={(value) => setOpen(value === 'item')}
    >
      <Accordion.Item value="item" className="border-t border-neutral">
        <div className="flex items-center gap-2">
          <Accordion.Trigger className="min-w-0 flex-1 cursor-pointer gap-3 bg-transparent px-0 text-left outline-brand-strong focus-visible:outline-2">
            <span className="min-w-0 break-all font-medium">{name || label}</span>
            {hasError ? <span className="text-xs text-negative">Action required</span> : null}
          </Accordion.Trigger>
          {remove}
        </div>
        <Accordion.Content className="bg-transparent pb-3">
          {getError?.(path) ? <p className="mb-2 text-xs text-negative">{getError(path)}</p> : null}
          <ObjectInputs fields={fields} path={path} value={value} onChange={onChange} getError={getError} />
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
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
  const addedKeys = useRef(new Set<number>())
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
          const remove = (
            <Button
              type="button"
              variant="plain"
              size="sm"
              disabled={rows.length <= min}
              aria-label={`Remove ${field.label} ${index + 1}`}
              onClick={() => {
                addedKeys.current.delete(keys.current[index])
                keys.current.splice(index, 1)
                onChange(rows.filter((_, candidate) => candidate !== index))
              }}
            >
              Remove
            </Button>
          )
          if (field.items.type === 'object') {
            return (
              <ObjectArrayItem
                key={keys.current[index]}
                fields={field.itemFields?.length === rows.length ? field.itemFields[index] : field.items.fields}
                value={row}
                onChange={update}
                path={rowPath}
                getError={getError}
                label={`${field.label} ${index + 1}`}
                sensitive={field.sensitive}
                initiallyOpen={addedKeys.current.has(keys.current[index])}
                remove={remove}
              />
            )
          }
          return (
            <fieldset key={keys.current[index]} className="min-w-0 border-t border-neutral pt-3">
              <legend className="text-sm font-medium">{`${field.label} ${index + 1}`}</legend>
              <div className="mb-2 flex justify-end">{remove}</div>
              <CatalogConfigurationInput
                field={{
                  ...field.items,
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
          const key = nextKey.current++
          keys.current.push(key)
          addedKeys.current.add(key)
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
    .with({ type: 'array' }, (array) => {
      const manifestField =
        array.items.type === 'object' && array.items.fields.length === 1 ? array.items.fields[0] : undefined
      if (
        manifestField?.type === 'string' &&
        manifestField.format === 'kubernetes-resource-yaml' &&
        (!array.itemFields?.length ||
          array.itemFields.every(
            (fields) =>
              fields.length === 1 &&
              fields[0].key === manifestField.key &&
              fields[0].type === 'string' &&
              fields[0].format === 'kubernetes-resource-yaml'
          ))
      ) {
        return (
          <CatalogYamlResourceList
            field={array}
            manifestField={manifestField}
            value={value}
            onChange={onChange}
            path={path}
            getError={getError}
          />
        )
      }
      return <ArrayInput field={array} value={value} onChange={onChange} path={path} getError={getError} />
    })
    .with({ type: 'object' }, (object) => (
      <fieldset className="min-w-0 border-l border-neutral pl-4">
        <legend className="mb-3 text-sm font-medium">{object.label}</legend>
        {object.description ? <p className="mb-3 text-ssm text-neutral-subtle">{object.description}</p> : null}
        <ObjectInputs fields={object.fields} value={value} onChange={onChange} path={path} getError={getError} />
        {getError?.(path) ? <p className="mt-2 text-xs text-negative">{getError(path)}</p> : null}
      </fieldset>
    ))
    .with({ type: 'string', format: 'kubernetes-resource-yaml' }, (scalar) => (
      <CatalogYamlInput
        field={scalar}
        value={String(getCatalogVariableValue(scalar, value) ?? '')}
        error={getError?.(path)}
        path={path}
        onChange={onChange}
      />
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
