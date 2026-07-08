import { type IconName } from '@fortawesome/fontawesome-common-types'
import {
  type BlueprintManifestVariableField,
  type BlueprintUpdateEngineFieldChange,
  type BlueprintUpdateNewOptionalValue,
  type BlueprintUpdateNewRequiredValue,
  type BlueprintUpdateRemovedValue,
  type BlueprintUpdateUpdatedValue,
} from 'qovery-typescript-axios'
import { type ReactNode, useEffect, useState } from 'react'
import { type AnyService } from '@qovery/domains/services/data-access'
import {
  Button,
  FunnelFlowBody,
  Icon,
  InputText,
  LoaderSpinner,
  LogoIcon,
  Skeleton,
  Tooltip,
  toast,
} from '@qovery/shared/ui'
import {
  type BlueprintFieldValue,
  type BlueprintFieldValues,
  getFieldValidationError,
  isFieldValid,
} from '../../blueprint-field-utils/blueprint-field-utils'
import { BlueprintManifestVariableInput } from '../../blueprint-manifest-variable-input/blueprint-manifest-variable-input'
import { useBlueprintUpdatePreviewSocket } from '../../hooks/use-blueprint-update-preview-socket/use-blueprint-update-preview-socket'
import { useBlueprintUpdate } from '../../hooks/use-blueprint-update/use-blueprint-update'
import { usePreviewBlueprintUpdate } from '../../hooks/use-preview-blueprint-update/use-preview-blueprint-update'
import { useUpdateBlueprint } from '../../hooks/use-update-blueprint/use-update-blueprint'

type BlueprintUpdateSection = 'required' | 'optional' | 'modified' | 'removed'

type BlueprintUpdateVariablePatch = Record<string, { value: string; is_secret?: boolean }>
type BlueprintUpdateField =
  | BlueprintUpdateNewRequiredValue
  | BlueprintUpdateNewOptionalValue
  | BlueprintUpdateUpdatedValue
type BlueprintUpdateEditableValue = BlueprintUpdateUpdatedValue | BlueprintUpdateEngineFieldChange

export interface BlueprintUpdateFlowProps {
  blueprintId: string
  clusterId?: string
  environmentId: string
  onExit: () => void
  organizationId: string
  service: AnyService
}

const updateSections: Array<{
  id: BlueprintUpdateSection
  title: string
  iconName: IconName
  description?: string
}> = [
  {
    id: 'required',
    title: 'New required values',
    iconName: 'circle-plus',
    description:
      "These are new fields we have added that don't have a default value and require you to enter a specific value for the update.",
  },
  {
    id: 'optional',
    title: 'New optional values',
    iconName: 'chart-bullet',
    description: 'These new fields have a default value, but you can override them if needed.',
  },
  {
    id: 'modified',
    title: 'Modified values',
    iconName: 'arrows-rotate',
    description: "Existing values that I've seen their default updated. Your overrides stays prioritaire.",
  },
  {
    id: 'removed',
    title: 'Removed values',
    iconName: 'circle-minus',
  },
]

const BLUEPRINT_RELEASE_NOTES_URL = 'https://github.com/Qovery/service-catalog/releases'

export function BlueprintUpdateFlow({
  blueprintId,
  clusterId,
  environmentId,
  onExit,
  organizationId,
  service,
}: BlueprintUpdateFlowProps) {
  const { data: blueprintUpdate } = useBlueprintUpdate({ blueprintId, suspense: true })
  const {
    mutateAsync: previewBlueprintUpdate,
    data: preview,
    isLoading: isPreviewLoading,
  } = usePreviewBlueprintUpdate()
  const { mutateAsync: updateBlueprint, isLoading: isUpdateLoading } = useUpdateBlueprint({
    environmentId,
    serviceId: service.id,
    serviceType: service.service_type,
  })
  const [currentStep, setCurrentStep] = useState<'review' | 'preview'>('review')
  const [activeSection, setActiveSection] = useState<BlueprintUpdateSection>(() =>
    blueprintUpdate ? getFirstAvailableUpdateSection(blueprintUpdate) : 'required'
  )
  const [completedSections, setCompletedSections] = useState<BlueprintUpdateSection[]>([])
  const [values, setValues] = useState<BlueprintFieldValues>({})
  const [initializedBlueprintId, setInitializedBlueprintId] = useState<string>()

  useEffect(() => {
    if (blueprintUpdate && initializedBlueprintId !== blueprintId) {
      setValues(getInitialUpdateValues(blueprintUpdate))
      setActiveSection(getFirstAvailableUpdateSection(blueprintUpdate))
      setInitializedBlueprintId(blueprintId)
    }
  }, [blueprintId, blueprintUpdate, initializedBlueprintId])

  if (!blueprintUpdate) return null

  const requiredValues = [...blueprintUpdate.new_required_values, ...blueprintUpdate.now_required_values]
  const sectionHasContent = {
    required: requiredValues.length > 0,
    optional: blueprintUpdate.new_optional_values.length > 0,
    modified: blueprintUpdate.updated_values.length > 0 || blueprintUpdate.engine_diff.updated_values.length > 0,
    removed: blueprintUpdate.removed_values.length > 0,
  }
  const visibleSections = updateSections.filter(({ id }) => sectionHasContent[id])
  const reviewSections = visibleSections.length > 0 ? visibleSections : updateSections.slice(0, 1)
  const hasSingleReviewSection = reviewSections.length === 1
  const activeSectionIndex = reviewSections.findIndex(({ id }) => id === activeSection)
  const isRequiredValid = requiredValues.every((value) =>
    isFieldValid(getBlueprintUpdateVariableField(value, true), values[value.name])
  )
  const isReviewComplete =
    reviewSections.every(({ id }) => completedSections.includes(id)) || reviewSections.length === 0
  const canContinueReview = hasSingleReviewSection ? activeSection !== 'required' || isRequiredValid : isReviewComplete
  const latestVersion = getVersionFromTag(blueprintUpdate.latest_tag) ?? blueprintUpdate.latest_tag
  const title = `${service.name} blueprint update to ${latestVersion}`
  const payload = buildBlueprintUpdatePayload({
    icon: service.icon_uri ?? getFallbackServiceIcon(service.service_type),
    name: service.name,
    tag: blueprintUpdate.latest_tag,
    values,
    optionalValues: blueprintUpdate.new_optional_values,
    requiredValues,
    updatedValues: [...blueprintUpdate.updated_values, ...blueprintUpdate.engine_diff.updated_values],
  })

  const completeActiveSection = () => {
    if (activeSection === 'required' && !isRequiredValid) return
    const nextCompletedSections = completedSections.includes(activeSection)
      ? completedSections
      : [...completedSections, activeSection]
    const nextSection = reviewSections[activeSectionIndex + 1]?.id

    setCompletedSections(nextCompletedSections)
    if (nextSection) setActiveSection(nextSection)
  }

  const handlePreview = async () => {
    if (!canContinueReview) return

    await previewBlueprintUpdate({ blueprintId, payload })
    setCurrentStep('preview')
  }

  const handleUpdate = async () => {
    await updateBlueprint({ blueprintId, payload })
    toast('success', 'Blueprint update started')
    onExit()
  }

  return (
    <BlueprintUpdateFlowShell currentStep={currentStep === 'review' ? 1 : 2} onExit={onExit}>
      {currentStep === 'review' ? (
        <FunnelFlowBody customContentWidth="max-w-[652px]">
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
            {reviewSections.map((section) => (
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
                    updatedValues={[...blueprintUpdate.updated_values, ...blueprintUpdate.engine_diff.updated_values]}
                    removedValues={blueprintUpdate.removed_values}
                    values={values}
                    onChange={(name, value) => setValues((currentValues) => ({ ...currentValues, [name]: value }))}
                    onContinue={completeActiveSection}
                    continueDisabled={section.id === 'required' && !isRequiredValid}
                    showContinueButton={!hasSingleReviewSection}
                  />
                )}
              </BlueprintUpdateSectionCard>
            ))}
          </div>

          <footer className="fixed bottom-0 left-1/2 z-10 w-full max-w-[620px] -translate-x-1/2 border-t border-neutral bg-background px-4 py-4">
            <Button
              type="button"
              size="lg"
              className="w-full justify-center"
              disabled={!canContinueReview || isPreviewLoading}
              loading={isPreviewLoading}
              onClick={handlePreview}
            >
              Continue
              <Icon iconName="arrow-right" />
            </Button>
          </footer>
        </FunnelFlowBody>
      ) : (
        <BlueprintUpdatePreview
          clusterId={clusterId}
          previewId={preview?.preview_id}
          organizationId={organizationId}
          onBack={() => setCurrentStep('review')}
          onConfirm={handleUpdate}
          loading={isUpdateLoading}
        />
      )}
    </BlueprintUpdateFlowShell>
  )
}

function BlueprintUpdateFlowShell({
  children,
  currentStep,
  onExit,
}: {
  children: ReactNode
  currentStep: 1 | 2
  onExit: () => void
}) {
  return (
    <div className="absolute inset-0 left-0 top-0 flex min-h-0 flex-col bg-background">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-neutral bg-background-secondary">
        <div className="flex h-full items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center border-r border-neutral">
            <LogoIcon width={28} height={28} />
          </div>
          <div className="flex items-center gap-2">
            <StepIndicator completed={currentStep > 1} active={currentStep === 1} number={1} title="Review update" />
            <Icon iconName="angle-right" className="text-xs text-neutral-subtle" />
            <StepIndicator active={currentStep === 2} number={2} title="Preview changes" />
          </div>
        </div>
        <div className="flex h-full items-center px-4">
          <Button
            type="button"
            variant="surface"
            color="neutral"
            size="md"
            iconOnly
            aria-label="Close"
            onClick={onExit}
          >
            <Icon iconName="xmark" iconStyle="regular" />
          </Button>
        </div>
      </header>
      <div className="relative flex min-h-0 flex-grow">{children}</div>
    </div>
  )
}

function StepIndicator({
  active,
  completed,
  number,
  title,
}: {
  active?: boolean
  completed?: boolean
  number: number
  title: string
}) {
  return (
    <div className="flex items-center gap-1.5">
      {completed ? (
        <Icon iconName="circle-check" className="text-xs text-positive" />
      ) : (
        <span
          className={`flex h-3.5 w-3.5 items-center justify-center rounded-full text-[10px] font-semibold ${
            active
              ? 'bg-surface-brand-solid text-neutralInvert'
              : 'border border-neutral bg-background text-neutral-disabled'
          }`}
        >
          {number}
        </span>
      )}
      <span className={`text-sm leading-5 ${active || completed ? 'text-neutral' : 'text-neutral-disabled'}`}>
        {title}
      </span>
    </div>
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
    <section className="rounded-xl border border-neutral bg-surface-neutral shadow-sm">
      <button
        type="button"
        className="flex w-full items-start justify-between gap-3 rounded-t-xl p-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-strong"
        aria-expanded={active}
        onClick={onClick}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Icon iconName={iconName} className="text-sm text-neutral-subtle" />
            <h2
              className={`text-base font-medium leading-6 ${active || completed ? 'text-neutral' : 'text-neutral-subtle'}`}
            >
              {title}
            </h2>
          </div>
          {active && description && <p className="mt-1 text-sm leading-5 text-neutral-subtle">{description}</p>}
        </div>
        {completed && <Icon iconName="circle-check" className="mt-1 text-sm text-positive" />}
      </button>
      {children && <div className="flex flex-col gap-4 px-4 pb-4">{children}</div>}
    </section>
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

      {section === 'modified' && (
        <UpdatedValuesList values={updatedValues} editableValues={values} onChange={onChange} />
      )}

      {section === 'removed' && <RemovedValuesList values={removedValues} />}

      {showContinueButton && (
        <Button
          type="button"
          size="md"
          color="neutral"
          className="w-fit"
          disabled={continueDisabled}
          onClick={onContinue}
        >
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
        const hasEditedOverride = hasManualOverride && getBlueprintUpdatePayloadValue(editedValue) !== newDefaultValue
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
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-subtle">
                  <div className="flex items-center gap-1.5">
                    <span>Default:</span>
                    <CodeChip>{formatUpdateValue(value.current_default_value)}</CodeChip>
                    <Icon iconName="arrow-right" className="text-xs" />
                    <CodeChip>{formatUpdateValue(value.new_default_value)}</CodeChip>
                  </div>
                  {hasEditedOverride && (
                    <div className="flex items-center gap-1.5">
                      <span>Override:</span>
                      <CodeChip color="info">{formatUpdateValue(editedValue)}</CodeChip>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
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
                    onClick={() =>
                      setEditedValueName((currentName) => (currentName === value.name ? undefined : value.name))
                    }
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

function RemovedValuesList({ values }: { values: Array<{ name: string }> }) {
  if (values.length === 0) return <p className="text-sm text-neutral-subtle">No removed values.</p>

  return (
    <div className="overflow-hidden rounded-md border border-neutral bg-surface-neutral-subtle">
      {values.map((value) => (
        <div
          key={value.name}
          className="flex items-center justify-between gap-3 border-b border-neutral p-3 last:border-b-0"
        >
          <p className="text-sm leading-5 text-neutral">{formatUpdateFieldLabel(value.name)}</p>
          <CodeChip color="negative">Deleted</CodeChip>
        </div>
      ))}
    </div>
  )
}

function CodeChip({ children, color = 'neutral' }: { children: ReactNode; color?: 'neutral' | 'info' | 'negative' }) {
  const className = {
    neutral: 'border-neutral bg-surface-neutral-component text-neutral',
    info: 'border-info-subtle bg-surface-info-component text-info',
    negative: 'border-negative-subtle bg-surface-negative-component text-negative',
  }[color]

  return <span className={`rounded-sm border px-1 font-mono text-xs leading-5 ${className}`}>{children}</span>
}

function BlueprintUpdatePreview({
  clusterId,
  loading,
  onBack,
  onConfirm,
  organizationId,
  previewId,
}: {
  clusterId?: string
  loading: boolean
  onBack: () => void
  onConfirm: () => void
  organizationId: string
  previewId?: string
}) {
  const {
    rawOutput,
    isLoading: isPreviewOutputLoading,
    hasError: hasPreviewOutputError,
    hasReceivedMessage: hasReceivedPreviewMessage,
  } = useBlueprintUpdatePreviewSocket({
    organizationId,
    clusterId,
    previewId,
  })

  return (
    <FunnelFlowBody customContentWidth="max-w-[620px]">
      <div className="flex flex-col gap-6 pb-20">
        <h1 className="text-2xl font-medium leading-8 text-neutral">Preview changes</h1>

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium leading-5 text-neutral">Raw output</h2>
          <div className="max-h-[420px] overflow-auto rounded-lg border border-neutral bg-surface-neutral px-4 py-3 font-mono text-xs leading-5 text-neutral">
            {rawOutput ? (
              <pre className="whitespace-pre-wrap">{rawOutput}</pre>
            ) : previewId ? (
              <div className="flex min-h-[72px] flex-col items-center justify-center gap-3 font-sans text-sm text-neutral-subtle">
                {!hasPreviewOutputError && <LoaderSpinner className="w-5" />}
                <p>{hasPreviewOutputError ? 'Unable to load preview output.' : 'Waiting for preview output…'}</p>
              </div>
            ) : (
              <Skeleton width="100%" height={72} />
            )}
          </div>
        </section>
      </div>

      <footer className="fixed bottom-0 left-1/2 z-10 flex w-full max-w-[620px] -translate-x-1/2 gap-3 border-t border-neutral bg-background px-4 py-4">
        <Button type="button" size="lg" variant="outline" color="neutral" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          size="lg"
          className="flex-1 justify-center"
          disabled={!hasReceivedPreviewMessage || isPreviewOutputLoading || loading}
          loading={loading}
          onClick={onConfirm}
        >
          Confirm & deploy update
          <Icon iconName="arrow-right" />
        </Button>
      </footer>
    </FunnelFlowBody>
  )
}

function getInitialUpdateValues(blueprintUpdate: NonNullable<ReturnType<typeof useBlueprintUpdate>['data']>) {
  return {
    ...Object.fromEntries(
      blueprintUpdate.new_optional_values.map((value) => [
        value.name,
        getBlueprintUpdateFieldValue(value, value.default_value),
      ])
    ),
  }
}

function getFirstAvailableUpdateSection(
  blueprintUpdate: NonNullable<ReturnType<typeof useBlueprintUpdate>['data']>
): BlueprintUpdateSection {
  if (blueprintUpdate.new_required_values.length > 0 || blueprintUpdate.now_required_values.length > 0) {
    return 'required'
  }
  if (blueprintUpdate.new_optional_values.length > 0) return 'optional'
  if (blueprintUpdate.updated_values.length > 0 || blueprintUpdate.engine_diff.updated_values.length > 0) {
    return 'modified'
  }
  if (blueprintUpdate.removed_values.length > 0) return 'removed'
  return 'required'
}

function buildBlueprintUpdatePayload({
  icon,
  name,
  optionalValues,
  requiredValues,
  tag,
  updatedValues,
  values,
}: {
  icon: string
  name: string
  optionalValues: BlueprintUpdateNewOptionalValue[]
  requiredValues: BlueprintUpdateNewRequiredValue[]
  tag: string
  updatedValues: BlueprintUpdateEditableValue[]
  values: BlueprintFieldValues
}) {
  const variables: BlueprintUpdateVariablePatch = {}

  requiredValues.forEach((field) => {
    const value = getBlueprintUpdatePayloadValue(values[field.name])
    if (value) variables[field.name] = { value, is_secret: field.is_secret }
  })
  optionalValues.forEach((field) => {
    const value = getBlueprintUpdatePayloadValue(values[field.name])
    if (value && value !== field.default_value) variables[field.name] = { value, is_secret: field.is_secret }
  })
  updatedValues.forEach((field) => {
    const value = getBlueprintUpdatePayloadValue(values[field.name])
    if (!value || value === field.new_default_value) return

    variables[field.name] = {
      value,
      ...(isBlueprintUpdateVariableField(field) ? { is_secret: field.is_secret } : {}),
    }
  })

  return {
    name,
    tag,
    icon,
    variables,
  }
}

function getBlueprintUpdateVariableField(
  field: BlueprintUpdateField,
  required: boolean,
  defaultValue?: string | null
): BlueprintManifestVariableField {
  return {
    kind: 'variable',
    name: field.name,
    type: field.type,
    required,
    is_secret: field.is_secret,
    allowed_values: field.allowed_values,
    default_value: defaultValue,
  }
}

function isBlueprintUpdateVariableField(
  field: BlueprintUpdateEditableValue | BlueprintUpdateNewOptionalValue
): field is BlueprintUpdateUpdatedValue | BlueprintUpdateNewOptionalValue {
  return 'type' in field && 'is_secret' in field
}

function getBlueprintUpdateFieldValue(
  field: BlueprintUpdateEditableValue | BlueprintUpdateNewOptionalValue,
  value?: string | null
): BlueprintFieldValue {
  if (isBlueprintUpdateVariableField(field) && field.type.type === 'bool' && !field.allowed_values?.length) {
    return value === 'true'
  }

  return value ?? ''
}

function getBlueprintUpdatePayloadValue(value: BlueprintFieldValue | undefined) {
  if (typeof value === 'boolean') return String(value)

  const trimmedValue = value?.trim()
  return trimmedValue ? trimmedValue : undefined
}

function formatUpdateFieldLabel(name: string) {
  const label = name.replace(/_/g, ' ')
  return `${label.charAt(0).toUpperCase()}${label.slice(1)}`
}

function formatUpdateValue(value?: BlueprintFieldValue | string | null) {
  if (typeof value === 'boolean') return String(value)
  return value && value.length > 0 ? value : '-'
}

function getVersionFromTag(tag: string) {
  return tag.split('/').filter(Boolean).at(-1)
}

function getFallbackServiceIcon(serviceType: AnyService['service_type']) {
  if (serviceType === 'HELM') return 'app://qovery-console/helm'
  if (serviceType === 'TERRAFORM') return 'app://qovery-console/terraform'
  return 'app://qovery-console/application'
}

export default BlueprintUpdateFlow
