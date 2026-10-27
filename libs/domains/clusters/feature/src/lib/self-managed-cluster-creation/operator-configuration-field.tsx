import clsx from 'clsx'
import { type FieldSchemaResponse, type PlatformComponentConfigurationViolationResponse } from 'qovery-typescript-axios'
import { useEffect, useRef } from 'react'
import { SchemaFieldInput, getSchemaFieldSummaryValue, getSchemaFieldValue } from '@qovery/shared/schema-fields/feature'
import { Button, EmptyState, Icon, useModal } from '@qovery/shared/ui'
import { ProfileArrayItemModal } from '../cluster-profile/profile-array-item-modal'
import {
  type PlatformArrayField,
  getFieldViolation,
  getPlatformArrayItemFields,
  getPlatformArrayItemPath,
  isPlainObject,
  isPlatformArrayField,
  isPlatformScalarField,
  toPlatformConfigurationValue,
  toSchemaField,
} from '../utils/platform-configuration-utils'

type Violations = PlatformComponentConfigurationViolationResponse[]

interface OperatorConfigurationFieldProps {
  field: FieldSchemaResponse
  value: unknown
  violations: Violations
  onChange: (value: unknown) => void
}

function isOperatorTaintsField(field: FieldSchemaResponse): field is PlatformArrayField {
  return isPlatformArrayField(field) && field.items.type === 'object' && field.label === 'Node group taints to tolerate'
}

export function isSupportedOperatorConfigurationField(field: FieldSchemaResponse) {
  return isPlatformScalarField(field) || isOperatorTaintsField(field)
}

function FieldError({ error }: { error?: string }) {
  return error ? <p className="mt-1 text-xs font-medium text-negative">{error}</p> : null
}

function getArrayItemViolations(violations: Violations, itemPath: string) {
  return violations.filter(
    ({ fieldPath }) =>
      fieldPath === itemPath || fieldPath.startsWith(`${itemPath}.`) || fieldPath.startsWith(`${itemPath}[`)
  )
}

function OperatorTaintsField({
  field,
  value,
  violations,
  onChange,
}: Omit<OperatorConfigurationFieldProps, 'field'> & { field: PlatformArrayField }) {
  const { openModal, closeModal } = useModal()
  const isItemModalOpenRef = useRef(false)
  const items: unknown[] = Array.isArray(value) ? value : []
  const { minItems, maxItems } = field.constraints
  const isUnderLimit = typeof maxItems !== 'number' || items.length < maxItems
  const canRemove = typeof minItems !== 'number' || items.length > minItems
  const error = getFieldViolation(violations, field.key)

  useEffect(
    () => () => {
      if (isItemModalOpenRef.current) closeModal()
    },
    [closeModal]
  )

  const openItemModal = (index?: number) => {
    const isEdit = index !== undefined
    const item = isEdit ? items[index] : undefined
    const itemValues = isPlainObject(item) ? item : {}
    const itemFields = getPlatformArrayItemFields(field, index ?? items.length).filter(isPlatformScalarField)

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
            // Preserve values omitted from the API's editable fields.
            const nextItem = {
              ...Object.fromEntries(
                Object.entries(itemValues).filter(([key]) => !itemFields.some((itemField) => itemField.key === key))
              ),
              ...submittedValues,
            }
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
      disabled={!isUnderLimit}
      onClick={() => openItemModal()}
    >
      <Icon iconName="circle-plus" iconStyle="regular" />
      Add taint
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
          {typeof maxItems === 'number' && !isUnderLimit ? (
            <p className="text-xs text-neutral-subtle">Limit of {maxItems} reached.</p>
          ) : null}
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          size="sm"
          icon="diagram-project"
          iconStyle="regular"
          title="No group taints added"
          description="Tolerating a taint without selecting a node is allowed."
        >
          {addButton}
        </EmptyState>
      ) : null}
      {items.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {items.map((item, index) => {
            const itemViolations = getArrayItemViolations(violations, getPlatformArrayItemPath(field.key, index))
            const itemFields = getPlatformArrayItemFields(field, index).filter(isPlatformScalarField)
            const itemValues = isPlainObject(item) ? item : {}
            const columns = itemFields.map((itemField) => ({
              label: itemField.label,
              value: String(
                getSchemaFieldSummaryValue(itemField, getSchemaFieldValue(itemField, itemValues[itemField.key])) ?? ''
              ),
            }))
            const itemName = columns[0]?.value || `Node group taint ${index + 1}`
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
                    <p className="font-medium text-neutral">Node group taint {index + 1}</p>
                    <div className="flex flex-wrap gap-x-2 gap-y-1 text-neutral-subtle">
                      {columns.map((column, columnIndex) => (
                        <span key={columnIndex} className="break-all">
                          {column.label}: {column.value || '—'}
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

export function OperatorConfigurationField({ field, value, violations, onChange }: OperatorConfigurationFieldProps) {
  if (isOperatorTaintsField(field)) {
    return <OperatorTaintsField field={field} value={value} violations={violations} onChange={onChange} />
  }

  if (!isPlatformScalarField(field)) return null

  const input = (
    <SchemaFieldInput
      booleanControl="toggle"
      field={toSchemaField({ ...field, description: undefined })}
      layout="card"
      disabled={field.readOnly}
      value={getSchemaFieldValue(field, value)}
      error={getFieldViolation(violations, field.key)}
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
