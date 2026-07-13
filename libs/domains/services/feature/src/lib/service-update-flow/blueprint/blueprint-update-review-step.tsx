import { type IconName } from '@fortawesome/fontawesome-common-types'
import {
  type BlueprintUpdateNewOptionalValue,
  type BlueprintUpdateNewRequiredValue,
  type BlueprintUpdateRemovedValue,
} from 'qovery-typescript-axios'
import { type ReactNode, useState } from 'react'
import { Badge, Button, FunnelFlowBody, Heading, Icon, InputText, Section, Tooltip } from '@qovery/shared/ui'
import {
  type BlueprintFieldValue,
  type BlueprintFieldValues,
  getFieldValidationError,
} from '../../blueprint-field-utils/blueprint-field-utils'
import { BlueprintManifestVariableInput } from '../../blueprint-manifest-variable-input/blueprint-manifest-variable-input'
import { useBlueprintUpdateFlowContext } from './blueprint-update-context'
import {
  BLUEPRINT_RELEASE_NOTES_URL,
  type BlueprintUpdateEditableValue,
  type BlueprintUpdateSection,
  getBlueprintUpdateFieldValue,
  getBlueprintUpdatePayloadValue,
  getBlueprintUpdateVariableField,
  isBlueprintUpdateVariableField,
  formatUpdateFieldLabel,
  formatUpdateValue,
} from './blueprint-update-utils'

export function BlueprintUpdateReviewStep({ onContinue }: { onContinue: () => void }) {
  const {
    activeSection,
    blueprintUpdate,
    canContinueReview,
    completeActiveSection,
    completedSections,
    isRequiredValid,
    requiredValues,
    reviewSections,
    setActiveSection,
    title,
    updatedValues,
    values,
    onChange,
  } = useBlueprintUpdateFlowContext()
  const hasSingleReviewSection = reviewSections.length === 1

  return (
    <FunnelFlowBody customContentWidth="max-w-[620px]">
      <header className="mb-6 flex flex-col items-start gap-2">
        <h1 className="text-2xl font-medium leading-8 text-neutral">{title}</h1>
        <a
          href={BLUEPRINT_RELEASE_NOTES_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
        >
          Release notes
          <Icon iconName="arrow-up-right-from-square" className="text-xs" />
        </a>
      </header>

      <div className="flex flex-col gap-3 pb-20">
        {reviewSections.length > 0 ? (
          reviewSections.map((section) => (
            <BlueprintUpdateSectionCard
              key={section.id}
              active={activeSection === section.id}
              completed={completedSections.includes(section.id)}
              iconName={section.iconName}
              title={section.title}
              description={section.description}
              onClick={() => setActiveSection(section.id)}
            >
              {activeSection === section.id && (
                <BlueprintUpdateSectionContent
                  section={section.id}
                  requiredValues={requiredValues}
                  optionalValues={blueprintUpdate.new_optional_values}
                  updatedValues={updatedValues}
                  removedValues={blueprintUpdate.removed_values}
                  values={values}
                  onChange={onChange}
                  onContinue={completeActiveSection}
                  continueDisabled={section.id === 'required' && !isRequiredValid}
                  showContinueButton={!hasSingleReviewSection}
                />
              )}
            </BlueprintUpdateSectionCard>
          ))
        ) : (
          <p className="text-sm leading-5 text-neutral-subtle">
            No configuration input is required. Continue to preview the update.
          </p>
        )}
      </div>

      <footer className="fixed bottom-0 left-1/2 z-10 w-full max-w-[620px] -translate-x-1/2 border-t border-neutral bg-background px-4 py-4">
        <Button type="button" size="lg" className="w-full justify-center" disabled={!canContinueReview} onClick={onContinue}>
          Continue
          <Icon iconName="arrow-right" />
        </Button>
      </footer>
    </FunnelFlowBody>
  )
}

function BlueprintUpdateSectionCard({
  active,
  children,
  completed,
  description,
  iconName,
  onClick,
  title,
}: {
  active: boolean
  children: ReactNode
  completed: boolean
  description?: string
  iconName: IconName
  onClick: () => void
  title: string
}) {
  return (
    <Section className="rounded-xl border border-neutral bg-surface-neutral shadow-sm">
      <button
        type="button"
        className="flex w-full items-start justify-between gap-3 rounded-t-xl p-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-strong"
        aria-expanded={active}
        onClick={onClick}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Icon iconName={iconName} className="text-sm text-neutral-subtle" />
            <Heading level={2} className={active || completed ? 'text-neutral' : 'text-neutral-subtle'}>
              {title}
            </Heading>
          </div>
          {active && description && <p className="mt-1 text-sm leading-5 text-neutral-subtle">{description}</p>}
        </div>
        {completed && <Icon iconName="circle-check" className="mt-1 text-sm text-positive" />}
      </button>
      {children && <div className="flex flex-col gap-4 px-4 pb-4">{children}</div>}
    </Section>
  )
}

function BlueprintUpdateSectionContent({
  continueDisabled,
  onChange,
  onContinue,
  optionalValues,
  removedValues,
  requiredValues,
  section,
  showContinueButton,
  updatedValues,
  values,
}: {
  continueDisabled: boolean
  onChange: (name: string, value: BlueprintFieldValue) => void
  onContinue: () => void
  optionalValues: BlueprintUpdateNewOptionalValue[]
  removedValues: BlueprintUpdateRemovedValue[]
  requiredValues: BlueprintUpdateNewRequiredValue[]
  section: BlueprintUpdateSection
  showContinueButton: boolean
  updatedValues: BlueprintUpdateEditableValue[]
  values: BlueprintFieldValues
}) {
  return (
    <>
      {section === 'required' && (
        <div className="flex flex-col gap-3">
          {requiredValues.map((value, index) => {
            const field = getBlueprintUpdateVariableField(value, true)

            return (
              <BlueprintManifestVariableInput
                key={value.name}
                field={field}
                value={values[value.name]}
                error={getFieldValidationError(field, values[value.name])}
                autoFocus={index === 0}
                onChange={(fieldValue) => onChange(value.name, fieldValue)}
              />
            )
          })}
        </div>
      )}

      {section === 'optional' && (
        <div className="flex flex-col gap-3">
          {optionalValues.map((value, index) => {
            const field = getBlueprintUpdateVariableField(value, false, value.default_value)

            return (
              <BlueprintManifestVariableInput
                key={value.name}
                field={field}
                value={values[value.name]}
                error={getFieldValidationError(field, values[value.name])}
                autoFocus={index === 0}
                onChange={(fieldValue) => onChange(value.name, fieldValue)}
              />
            )
          })}
        </div>
      )}

      {section === 'modified' && <UpdatedValuesList values={updatedValues} editableValues={values} onChange={onChange} />}
      {section === 'removed' && <RemovedValuesList values={removedValues} />}

      {showContinueButton && (
        <Button type="button" size="md" color="neutral" className="w-fit" disabled={continueDisabled} onClick={onContinue}>
          Continue
          <Icon iconName="arrow-right" />
        </Button>
      )}
    </>
  )
}

function UpdatedValuesList({
  editableValues,
  onChange,
  values,
}: {
  editableValues: BlueprintFieldValues
  onChange: (name: string, value: BlueprintFieldValue) => void
  values: BlueprintUpdateEditableValue[]
}) {
  const [editedValueName, setEditedValueName] = useState<string>()

  if (values.length === 0) return <p className="text-sm text-neutral-subtle">No modified values.</p>

  return (
    <div className="overflow-hidden rounded-md border border-neutral bg-surface-neutral-subtle">
      {values.map((value) => {
        const label = formatUpdateFieldLabel(value.name)
        const hasManualOverride = Object.prototype.hasOwnProperty.call(editableValues, value.name)
        const editedValue = hasManualOverride
          ? editableValues[value.name] ?? ''
          : getBlueprintUpdateFieldValue(value, value.new_default_value)
        const newDefaultValue = value.new_default_value ?? ''
        const overrideValue = getBlueprintUpdatePayloadValue(editedValue)
        const hasEditedOverride = hasManualOverride && overrideValue !== undefined && overrideValue !== newDefaultValue
        const editing = editedValueName === value.name
        const canUseTypedInput = isBlueprintUpdateVariableField(value)
        const field = canUseTypedInput
          ? getBlueprintUpdateVariableField(value, false, value.new_default_value)
          : undefined

        return (
          <div key={value.name} className="flex flex-col gap-3 border-b border-neutral p-3 last:border-b-0">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm leading-5 text-neutral">{label}</p>
                <div className="flex min-h-6 flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-subtle">
                  <div className="flex items-center gap-1.5">
                    <span>Default:</span>
                    <code className="rounded bg-surface-neutral-component px-1 py-0.5 font-mono text-xs">
                      {formatUpdateValue(value.current_default_value)}
                    </code>
                    <Icon iconName="arrow-right" className="text-xs" />
                    <code className="rounded bg-surface-neutral-component px-1 py-0.5 font-mono text-xs">
                      {formatUpdateValue(value.new_default_value)}
                    </code>
                  </div>
                  {hasEditedOverride && (
                    <div className="flex items-center gap-1.5">
                      <span>Override:</span>
                      <code className="rounded border border-info-subtle bg-surface-info-subtle px-1 py-0.5 font-mono text-xs text-info">
                        {formatUpdateValue(editedValue)}
                      </code>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex w-14 shrink-0 items-center justify-end gap-2">
                {hasEditedOverride && (
                  <Tooltip content={<span>Reset the override to the new default value</span>}>
                    <Button
                      type="button"
                      variant="outline"
                      color="neutral"
                      size="xs"
                      iconOnly
                      aria-label={`Reset ${label} override to default`}
                      onClick={() => {
                        onChange(value.name, getBlueprintUpdateFieldValue(value, value.new_default_value))
                        setEditedValueName(undefined)
                      }}
                    >
                      <Icon iconName="arrow-rotate-left" iconStyle="regular" className="text-xs" />
                    </Button>
                  </Tooltip>
                )}
                <Tooltip content="Edit">
                  <Button
                    type="button"
                    variant="outline"
                    color="neutral"
                    size="xs"
                    iconOnly
                    aria-label={`Edit ${label} override`}
                    onClick={() => setEditedValueName((currentName) => (currentName === value.name ? undefined : value.name))}
                  >
                    <Icon iconName="pen" iconStyle="regular" className="text-xs" />
                  </Button>
                </Tooltip>
              </div>
            </div>

            {editing &&
              (field ? (
                <BlueprintManifestVariableInput
                  autoFocus
                  error={getFieldValidationError(field, editedValue)}
                  field={field}
                  label="Override"
                  value={editedValue}
                  onChange={(fieldValue) => onChange(value.name, fieldValue)}
                />
              ) : (
                <InputText
                  name={value.name}
                  label="Override"
                  value={getBlueprintUpdatePayloadValue(editedValue) ?? ''}
                  autoFocus
                  onChange={(event) => onChange(value.name, event.currentTarget.value)}
                />
              ))}
          </div>
        )
      })}
    </div>
  )
}

function RemovedValuesList({ values }: { values: BlueprintUpdateRemovedValue[] }) {
  if (values.length === 0) return <p className="text-sm text-neutral-subtle">No removed values.</p>

  return (
    <div className="overflow-hidden rounded-md border border-neutral bg-surface-neutral-subtle">
      {values.map((value) => (
        <div key={value.name} className="flex items-center justify-between gap-3 border-b border-neutral p-3 last:border-b-0">
          <p className="text-sm leading-5 text-neutral">{formatUpdateFieldLabel(value.name)}</p>
          <Badge size="sm" variant="surface" color="red">
            Deleted
          </Badge>
        </div>
      ))}
    </div>
  )
}
