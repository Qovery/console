import clsx from 'clsx'
import { type FieldSchemaResponse, type PlatformComponentConfigurationViolationResponse } from 'qovery-typescript-axios'
import { useEffect, useRef } from 'react'
import {
  SchemaFieldDescription,
  SchemaFieldInput,
  getSchemaFieldSummaryValue,
  getSchemaFieldValue,
} from '@qovery/shared/schema-fields/feature'
import { Button, EmptyState, Icon, useModal } from '@qovery/shared/ui'
import { ProfileArrayItemModal } from '../cluster-profile/profile-array-item-modal'
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
  toPlatformArrayItemDescriptor,
  toPlatformConfigurationValue,
  toSchemaField,
} from '../utils/platform-configuration-utils'

type Violations = PlatformComponentConfigurationViolationResponse[]

interface OperatorConfigurationFieldProps {
  field: FieldSchemaResponse
  path: string
  value: unknown
  violations: Violations
  onChange: (value: unknown) => void
}

function FieldError({ error }: { error?: string }) {
  return error ? <p className="mt-1 text-xs font-medium text-negative">{error}</p> : null
}

function CompositeFieldHeader({ field, error }: { field: PlatformObjectField; error?: string }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-neutral">{field.label}</p>
        {field.description ? <SchemaFieldDescription description={field.description} /> : null}
        <FieldError error={error} />
      </div>
    </div>
  )
}

function NestedFields({
  fields,
  path,
  value,
  violations,
  onChange,
}: {
  fields: FieldSchemaResponse[]
  path: string
  value: unknown
  violations: Violations
  onChange: (value: Record<string, unknown>) => void
}) {
  const values = isPlainObject(value) ? value : {}

  return (
    <div className="flex flex-col gap-3">
      {fields.map((childField) => (
        <OperatorConfigurationField
          key={childField.key}
          field={childField}
          path={getPlatformFieldPath(path, childField.key)}
          value={values[childField.key]}
          violations={violations}
          onChange={(childValue) => {
            const { [childField.key]: _, ...otherValues } = values
            onChange(childValue === undefined ? otherValues : { ...otherValues, [childField.key]: childValue })
          }}
        />
      ))}
    </div>
  )
}

function OperatorObjectField({
  field,
  path,
  value,
  violations,
  onChange,
}: Omit<OperatorConfigurationFieldProps, 'field'> & { field: PlatformObjectField }) {
  return (
    <div className="flex flex-col gap-3">
      <CompositeFieldHeader field={field} error={getFieldViolation(violations, path)} />
      <div className="flex flex-col gap-3">
        <NestedFields fields={field.fields} path={path} value={value} violations={violations} onChange={onChange} />
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
    return [String(getSchemaFieldSummaryValue(itemField, getSchemaFieldValue(itemField, item)) ?? '')]
  }

  const values = isPlainObject(item) ? item : {}
  return getPlatformArrayItemFields(field, index)
    .filter(isPlatformScalarField)
    .map((itemField) =>
      String(getSchemaFieldSummaryValue(itemField, getSchemaFieldValue(itemField, values[itemField.key])) ?? '')
    )
}

function OperatorArrayField({
  field,
  path,
  value,
  violations,
  onChange,
}: Omit<OperatorConfigurationFieldProps, 'field'> & { field: PlatformArrayField }) {
  const { openModal, closeModal } = useModal()
  const isItemModalOpenRef = useRef(false)
  const items: unknown[] = Array.isArray(value) ? value : []
  const { minItems, maxItems } = field.constraints
  const isUnderLimit = typeof maxItems !== 'number' || items.length < maxItems
  const hasNestedItemFields =
    field.items.type === 'object' && field.items.fields.some((itemField) => !isPlatformScalarField(itemField))
  const canAdd = isUnderLimit && !hasNestedItemFields
  const canRemove = typeof minItems !== 'number' || items.length > minItems
  const error = getFieldViolation(violations, path)
  const isTaintField = field.label === 'Node group taints to tolerate'

  useEffect(
    () => () => {
      if (isItemModalOpenRef.current) closeModal()
    },
    [closeModal]
  )

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
          onMountedChange={(isMounted) => {
            isItemModalOpenRef.current = isMounted
          }}
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

  const addButton = (
    <Button
      type="button"
      variant={items.length === 0 ? 'solid' : 'outline'}
      color="neutral"
      size="sm"
      disabled={!canAdd}
      onClick={() => openItemModal()}
    >
      <Icon iconName="circle-plus" iconStyle="regular" />
      {isTaintField ? 'Add taint' : 'Add item'}
    </Button>
  )

  return (
    <div className="mt-3 flex flex-col gap-3">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-neutral">
            {field.label}
            {!field.required ? ' (optional)' : null}
          </p>
          <FieldError error={error} />
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {items.length > 0 ? addButton : null}
          {hasNestedItemFields ? (
            <p className="text-xs text-neutral-subtle">Items with nested settings cannot be added here yet.</p>
          ) : typeof maxItems === 'number' && !isUnderLimit ? (
            <p className="text-xs text-neutral-subtle">Limit of {maxItems} reached.</p>
          ) : null}
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          size="sm"
          icon="diagram-project"
          iconStyle="regular"
          title={isTaintField ? 'No group taints added' : 'No items added'}
          description={isTaintField ? 'Tolerating a taint without selecting a node is allowed.' : field.description}
        >
          {addButton}
        </EmptyState>
      ) : null}
      {items.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {items.map((item, index) => {
            const itemViolations = getArrayItemViolations(violations, getPlatformArrayItemPath(path, index))
            const columns = getArrayItemColumns(field, item, index)
            const [primaryValue] = columns
            const itemFields = getPlatformArrayItemFields(field, index).filter(isPlatformScalarField)
            const itemName = primaryValue || `Item ${index + 1}`
            return (
              <li key={index} className="flex flex-col">
                <div
                  className={clsx(
                    'flex min-h-11 items-center gap-4 rounded-md border',
                    'bg-surface-neutral-subtle px-4 py-3',
                    itemViolations.length ? 'border-negative-strong' : 'border-neutral'
                  )}
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-1 text-ssm">
                    <p className="font-medium text-neutral">
                      {isTaintField ? `Node group taint ${index + 1}` : itemName}
                    </p>
                    <div className="flex flex-wrap gap-x-2 gap-y-1 text-neutral-subtle">
                      {columns.map((column, columnIndex) => (
                        <span key={columnIndex} className="break-all">
                          {itemFields[columnIndex]?.label ?? 'Value'}: {column || '—'}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="ml-auto flex shrink-0 items-center gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      color="neutral"
                      size="xs"
                      className="bg-surface-neutral-component"
                      iconOnly
                      aria-label={`Edit ${itemName}`}
                      onClick={() => openItemModal(index)}
                    >
                      <Icon iconName="gear-complex" iconStyle="regular" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      color="neutral"
                      size="xs"
                      className="bg-surface-neutral-component"
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

export function OperatorConfigurationField({
  field,
  path,
  value,
  violations,
  onChange,
}: OperatorConfigurationFieldProps) {
  if (isPlatformArrayField(field)) {
    return <OperatorArrayField field={field} path={path} value={value} violations={violations} onChange={onChange} />
  }

  if (isPlatformObjectField(field)) {
    return <OperatorObjectField field={field} path={path} value={value} violations={violations} onChange={onChange} />
  }

  if (!isPlatformScalarField(field)) return null

  const input = (
    <SchemaFieldInput
      booleanControl="toggle"
      // Nested fields reuse keys like `name`: the full path keeps input ids unique.
      field={toSchemaField({ ...field, key: path, description: undefined })}
      layout="card"
      disabled={field.readOnly}
      value={getSchemaFieldValue(field, value)}
      error={getFieldViolation(violations, path)}
      onChange={(nextValue) => onChange(toPlatformConfigurationValue(field, nextValue))}
    />
  )
  return (
    <div className="flex flex-col gap-1">
      {input}
      {field.description ? <p className="text-sm text-neutral-subtle">{field.description}</p> : null}
    </div>
  )
}
