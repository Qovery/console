import { type FieldSchemaResponse, type PlatformComponentConfigurationViolationResponse } from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import { CatalogVariableDescription, CatalogVariableInput } from '@qovery/shared/console-shared'
import { Button, HighlightText, Icon, useModal } from '@qovery/shared/ui'
import { getCatalogSummaryFieldValue, getCatalogVariableValue } from '@qovery/shared/util-js'
import {
  type PlatformArrayField,
  type PlatformObjectField,
  getFieldViolation,
  getPlatformArrayItemFields,
  getPlatformArrayItemPath,
  getPlatformFieldPath,
  isPlainObject,
  isPlatformArrayField,
  isPlatformObjectField,
  isPlatformScalarField,
  toCatalogVariableField,
  toPlatformArrayItemDescriptor,
  toPlatformConfigurationValue,
} from '../platform-configuration/platform-configuration-utils'
import { ProfileArrayItemModal } from './profile-array-item-modal'

type Violations = PlatformComponentConfigurationViolationResponse[]

interface ProfileConfigurationFieldProps {
  field: FieldSchemaResponse
  path: string
  value: unknown
  violations: Violations
  highlight?: string
  onChange: (value: unknown) => void
}

function FieldError({ error }: { error?: string }) {
  return error ? <p className="mt-1 text-xs font-medium text-negative">{error}</p> : null
}

function CompositeFieldHeader({
  field,
  error,
  highlight,
  children,
}: {
  field: PlatformArrayField | PlatformObjectField
  error?: string
  highlight?: string
  children?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-neutral">
          <HighlightText text={field.label} highlight={highlight} />
        </p>
        {field.description ? (
          <CatalogVariableDescription description={field.description} highlight={highlight} />
        ) : null}
        <FieldError error={error} />
      </div>
      {children}
    </div>
  )
}

function NestedFields({
  fields,
  path,
  value,
  violations,
  highlight,
  onChange,
}: {
  fields: FieldSchemaResponse[]
  path: string
  value: unknown
  violations: Violations
  highlight?: string
  onChange: (value: Record<string, unknown>) => void
}) {
  const values = isPlainObject(value) ? value : {}

  return (
    <div className="flex flex-col [&>*:last-child]:border-b-0">
      {fields.map((childField) => (
        <ProfileConfigurationField
          key={childField.key}
          field={childField}
          path={getPlatformFieldPath(path, childField.key)}
          value={values[childField.key]}
          violations={violations}
          highlight={highlight}
          onChange={(childValue) => {
            const { [childField.key]: _, ...otherValues } = values
            onChange(childValue === undefined ? otherValues : { ...otherValues, [childField.key]: childValue })
          }}
        />
      ))}
    </div>
  )
}

function ProfileObjectField({
  field,
  path,
  value,
  violations,
  highlight,
  onChange,
}: Omit<ProfileConfigurationFieldProps, 'field'> & { field: PlatformObjectField }) {
  return (
    <div className="flex flex-col gap-3 border-b border-neutral p-4">
      <CompositeFieldHeader field={field} error={getFieldViolation(violations, path)} highlight={highlight} />
      <div className="overflow-hidden rounded-md border border-neutral">
        <NestedFields
          fields={field.fields}
          path={path}
          value={value}
          violations={violations}
          highlight={highlight}
          onChange={onChange}
        />
      </div>
    </div>
  )
}

function getArrayItemViolations(violations: Violations, itemPath: string) {
  return violations.filter(
    ({ fieldPath }) =>
      fieldPath === itemPath || fieldPath.startsWith(`${itemPath}.`) || fieldPath.startsWith(`${itemPath}[`)
  )
}

// Values shown for each item row, one column per scalar item field (sensitive values masked).
function getArrayItemColumns(field: PlatformArrayField, item: unknown, index: number) {
  if (field.items.type !== 'object') {
    const itemField = toPlatformArrayItemDescriptor(field)
    return [String(getCatalogSummaryFieldValue(itemField, getCatalogVariableValue(itemField, item)) ?? '')]
  }

  const values = isPlainObject(item) ? item : {}
  return getPlatformArrayItemFields(field, index)
    .filter(isPlatformScalarField)
    .map((itemField) =>
      String(getCatalogSummaryFieldValue(itemField, getCatalogVariableValue(itemField, values[itemField.key])) ?? '')
    )
}

function ProfileArrayField({
  field,
  path,
  value,
  violations,
  highlight,
  onChange,
}: Omit<ProfileConfigurationFieldProps, 'field'> & { field: PlatformArrayField }) {
  const { openModal, closeModal } = useModal()
  const items: unknown[] = Array.isArray(value) ? value : []
  const { minItems, maxItems } = field.constraints
  const canAdd = typeof maxItems !== 'number' || items.length < maxItems
  const canRemove = typeof minItems !== 'number' || items.length > minItems
  const error = getFieldViolation(violations, path)

  const openItemModal = (index?: number) => {
    const isEdit = index !== undefined
    const item = isEdit ? items[index] : undefined
    const isObjectItem = field.items.type === 'object'
    const itemValues = isObjectItem ? (isPlainObject(item) ? item : {}) : { value: item }
    const itemFields = isObjectItem
      ? getPlatformArrayItemFields(field, index ?? items.length).filter(isPlatformScalarField)
      : [toPlatformArrayItemDescriptor(field)]

    openModal({
      content: (
        <ProfileArrayItemModal
          title={field.label}
          description={field.description}
          fields={itemFields}
          values={itemValues}
          isEdit={isEdit}
          onClose={closeModal}
          onSubmit={(submittedValues) => {
            // Keep keys the modal does not edit (non-scalar or unevaluated fields) on existing object items.
            const nextItem = isObjectItem
              ? {
                  ...Object.fromEntries(
                    Object.entries(itemValues).filter(([key]) => !itemFields.some((itemField) => itemField.key === key))
                  ),
                  ...submittedValues,
                }
              : submittedValues['value']
            onChange(
              isEdit
                ? items.map((currentItem, itemIndex) => (itemIndex === index ? nextItem : currentItem))
                : [...items, nextItem]
            )
          }}
        />
      ),
    })
  }

  return (
    <div className="flex flex-col gap-4 border-b border-neutral p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-neutral">
            <HighlightText text={field.label} highlight={highlight} />
          </p>
          {field.description ? (
            <CatalogVariableDescription description={field.description} highlight={highlight} />
          ) : null}
          <FieldError error={error} />
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <Button
            type="button"
            variant="outline"
            color="neutral"
            size="md"
            aria-label={`Add item to ${field.label}`}
            disabled={!canAdd}
            onClick={() => openItemModal()}
          >
            <Icon iconName="circle-plus" iconStyle="regular" />
            Add item
          </Button>
          {typeof maxItems === 'number' && !canAdd ? (
            <p className="text-xs text-neutral-subtle">Limit of {maxItems} reached.</p>
          ) : null}
        </div>
      </div>

      {items.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {items.map((item, index) => {
            const itemViolations = getArrayItemViolations(violations, getPlatformArrayItemPath(path, index))
            const [primaryValue, ...otherValues] = getArrayItemColumns(field, item, index)
            const itemName = primaryValue || `Item ${index + 1}`
            return (
              <li key={index} className="flex flex-col">
                <div
                  className={`flex min-h-11 items-center gap-4 rounded-md border bg-surface-neutral py-2 pl-4 pr-2 ${
                    itemViolations.length ? 'border-negative-strong' : 'border-neutral'
                  }`}
                >
                  <p className="w-1/4 min-w-0 shrink-0 truncate text-sm font-medium text-neutral">{itemName}</p>
                  {otherValues.map((otherValue, valueIndex) => (
                    <p key={valueIndex} className="min-w-0 flex-1 truncate text-sm text-neutral-subtle">
                      {otherValue}
                    </p>
                  ))}
                  <div className="ml-auto flex shrink-0 items-center gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      color="neutral"
                      size="sm"
                      iconOnly
                      aria-label={`Edit ${itemName}`}
                      onClick={() => openItemModal(index)}
                    >
                      <Icon iconName="pen" iconStyle="regular" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      color="neutral"
                      size="sm"
                      iconOnly
                      aria-label={`Remove ${itemName}`}
                      disabled={!canRemove}
                      onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
                    >
                      <Icon iconName="trash-can" iconStyle="regular" />
                    </Button>
                  </div>
                </div>
                {itemViolations.map((violation) => (
                  <FieldError key={`${violation.fieldPath}-${violation.code}`} error={violation.message} />
                ))}
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

export function ProfileConfigurationField({
  field,
  path,
  value,
  violations,
  highlight,
  onChange,
}: ProfileConfigurationFieldProps) {
  if (isPlatformArrayField(field)) {
    return (
      <ProfileArrayField
        field={field}
        path={path}
        value={value}
        violations={violations}
        highlight={highlight}
        onChange={onChange}
      />
    )
  }

  if (isPlatformObjectField(field)) {
    return (
      <ProfileObjectField
        field={field}
        path={path}
        value={value}
        violations={violations}
        highlight={highlight}
        onChange={onChange}
      />
    )
  }

  if (!isPlatformScalarField(field)) return null

  return (
    <CatalogVariableInput
      booleanControl="toggle"
      // Nested fields reuse keys like `name`: the full path keeps input ids unique.
      field={toCatalogVariableField({ ...field, key: path })}
      layout="row"
      value={getCatalogVariableValue(field, value)}
      error={getFieldViolation(violations, path)}
      highlight={highlight}
      onChange={(nextValue) => onChange(toPlatformConfigurationValue(field, nextValue))}
    />
  )
}
