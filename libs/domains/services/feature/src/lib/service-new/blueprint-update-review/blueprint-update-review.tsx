import { useState } from 'react'
import { Badge, Button, FunnelFlow, Heading, Icon, InputText, Section } from '@qovery/shared/ui'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RequiredInput {
  id: string
  label: string
  helper?: string
  placeholder?: string
}

export interface ChangedField {
  id: string
  label: string
  category: string
  currentValue: string
  newDefault: string
  isUserOverride: boolean
}

export interface AddedField {
  id: string
  label: string
  category: string
  defaultValue: string
  helper?: string
}

export interface RemovedField {
  id: string
  label: string
  category: string
  currentValue?: string
  isDestructive: boolean
}

export interface BlueprintUpdateReviewProps {
  blueprintName: string
  currentVersion: string
  targetVersion: string
  releaseNotesUrl?: string
  requiredInputs: RequiredInput[]
  changedFields: ChangedField[]
  addedFields: AddedField[]
  removedFields: RemovedField[]
  onBack: () => void
  onDeploy: () => void
  onDeployWithPreview: () => void
}

// ─── Mock data (AWS S3 blueprint v2.0 → v2.1) ────────────────────────────────

export const MOCK_REQUIRED_INPUTS: RequiredInput[] = [
  {
    id: 'notification_topic_arn',
    label: 'SNS notification topic ARN',
    helper: 'ARN of the SNS topic to receive S3 event notifications.',
  },
]

export const MOCK_CHANGED_FIELDS: ChangedField[] = [
  {
    id: 'lifecycle_retention_days',
    label: 'Lifecycle retention (days)',
    category: 'Config',
    currentValue: '90',
    newDefault: '180',
    isUserOverride: false,
  },
  {
    id: 'encryption_algorithm',
    label: 'Encryption algorithm',
    category: 'Config',
    currentValue: 'AES256',
    newDefault: 'aws:kms',
    isUserOverride: true,
  },
]

const MOCK_OVERRIDE_VALUES: Record<string, string | null> = {
  encryption_algorithm: 'aws:kms:alias/acme-service-key',
}

export const MOCK_ADDED_FIELDS: AddedField[] = [
  {
    id: 'intelligent_tiering',
    label: 'Intelligent-Tiering storage class',
    category: 'Config',
    defaultValue: 'false',
    helper: 'Automatically moves objects between access tiers based on usage patterns.',
  },
  {
    id: 'access_log_bucket',
    label: 'Access log destination bucket',
    category: 'Config',
    defaultValue: 'acme-access-logs',
    helper: 'Leave empty to disable access logging.',
  },
  {
    id: 'cloudwatch_metrics',
    label: 'CloudWatch request metrics',
    category: 'Infrastructure',
    defaultValue: 'true',
    helper: 'Enables per-request metrics in CloudWatch.',
  },
]

export const MOCK_REMOVED_FIELDS: RemovedField[] = [
  {
    id: 'legacy_acl',
    label: 'ACL (legacy)',
    category: 'Config',
    currentValue: 'private',
    isDestructive: false,
  },
  {
    id: 'request_payer',
    label: 'Request Payer configuration',
    category: 'Infrastructure',
    currentValue: 'BucketOwner',
    isDestructive: true,
  },
]

type ReviewStepId = 'required' | 'optional' | 'modified' | 'removed'

const REVIEW_STEPS: { id: ReviewStepId; title: string; iconName: string; description?: string }[] = [
  {
    id: 'required',
    title: 'New required values',
    iconName: 'circle-plus',
    description: 'These new fields have no default value. You need to fill them before deploying the update.',
  },
  {
    id: 'optional',
    title: 'New optional values',
    iconName: 'chart-bullet',
    description: 'These new fields include defaults, and you can override them if needed.',
  },
  {
    id: 'modified',
    title: 'Modified values',
    iconName: 'arrows-rotate',
    description: 'Default values have been updated. Your overrides are preserved until you reset them.',
  },
  {
    id: 'removed',
    title: 'Removed values',
    iconName: 'circle-minus',
  },
]

const REVIEW_CARD_CLASSNAME =
  'rounded-[12px] border border-neutral bg-surface-neutral shadow-[0_0_2px_rgba(0,0,0,0.01),0_2px_1.5px_rgba(0,0,0,0.02)]'

// ─── Component ───────────────────────────────────────────────────────────────

export function BlueprintUpdateReview({
  blueprintName,
  targetVersion,
  requiredInputs,
  changedFields,
  addedFields,
  removedFields,
  onBack,
  onDeploy,
}: BlueprintUpdateReviewProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [inputValues, setInputValues] = useState<Record<string, string>>({})
  const [additionValues, setAdditionValues] = useState<Record<string, string>>(
    Object.fromEntries(addedFields.map((field) => [field.id, field.defaultValue]))
  )
  const [defaultValues, setDefaultValues] = useState<Record<string, string>>(
    Object.fromEntries(changedFields.map((field) => [field.id, field.newDefault]))
  )
  const [overrideValues, setOverrideValues] = useState<Record<string, string | null>>(
    Object.fromEntries(
      changedFields.map((field) => [
        field.id,
        field.isUserOverride ? MOCK_OVERRIDE_VALUES[field.id] ?? field.currentValue : null,
      ])
    )
  )
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null)

  const currentStep = REVIEW_STEPS[currentStepIndex]
  const completedStepIds = new Set(REVIEW_STEPS.slice(0, currentStepIndex).map((step) => step.id))

  const isRequiredStepComplete = requiredInputs.every((field) => Boolean(inputValues[field.id]?.trim()))
  const canConfirmDeploy = currentStep.id === 'removed' && isRequiredStepComplete

  const continueToNextStep = () => {
    setCurrentStepIndex((previous) => Math.min(previous + 1, REVIEW_STEPS.length - 1))
  }

  const renderCollapsedStepCard = (step: (typeof REVIEW_STEPS)[number], isCompleted: boolean, isCurrent: boolean) => {
    const titleClassName = isCurrent || isCompleted ? 'text-neutral' : 'text-neutral-subtle'

    return (
      <div key={step.id} className={REVIEW_CARD_CLASSNAME}>
        <div className="flex items-center justify-between gap-3 p-4">
          <div className="flex min-w-0 items-center gap-2">
            <Icon iconName={step.iconName} iconStyle="regular" className="text-sm text-neutral-subtle" />
            <p className={`truncate text-base font-medium ${titleClassName}`}>{step.title}</p>
          </div>
          {isCompleted ? <Icon iconName="circle-check" iconStyle="regular" className="text-sm text-positive" /> : null}
        </div>
      </div>
    )
  }

  const renderContinueButton = (disabled = false) => (
    <div>
      <Button
        type="button"
        size="md"
        color="neutral"
        variant="solid"
        radius="rounded"
        disabled={disabled}
        onClick={continueToNextStep}
      >
        <span className="inline-flex items-center gap-2">
          Continue
          <Icon iconName="arrow-right" iconStyle="regular" className="text-sm" />
        </span>
      </Button>
    </div>
  )

  const renderStepContent = () => {
    if (currentStep.id === 'required') {
      return (
        <>
          <div className="flex flex-col gap-3">
            {requiredInputs.length > 0 ? (
              requiredInputs.map((field) => (
                <InputText
                  key={field.id}
                  name={field.id}
                  label={field.label}
                  hint={field.helper}
                  value={inputValues[field.id] ?? ''}
                  onChange={(event) => setInputValues((previous) => ({ ...previous, [field.id]: event.target.value }))}
                />
              ))
            ) : (
              <p className="text-sm text-neutral-subtle">No new required values were introduced in this update.</p>
            )}
          </div>
          {renderContinueButton(!isRequiredStepComplete)}
        </>
      )
    }

    if (currentStep.id === 'optional') {
      return (
        <>
          <div className="flex flex-col gap-3">
            {addedFields.length > 0 ? (
              addedFields.map((field) => (
                <InputText
                  key={field.id}
                  name={field.id}
                  label={field.label}
                  hint={field.helper}
                  value={additionValues[field.id] ?? ''}
                  onChange={(event) =>
                    setAdditionValues((previous) => ({ ...previous, [field.id]: event.target.value }))
                  }
                />
              ))
            ) : (
              <p className="text-sm text-neutral-subtle">No new optional values were introduced in this update.</p>
            )}
          </div>
          {renderContinueButton()}
        </>
      )
    }

    if (currentStep.id === 'modified') {
      return (
        <>
          <div className="rounded-md border border-neutral bg-surface-neutral-subtle">
            {changedFields.length > 0 ? (
              changedFields.map((field, index) => {
                const hasOverride = Boolean(overrideValues[field.id])
                const isEditing = editingFieldId === field.id

                return (
                  <div
                    key={field.id}
                    className={`flex justify-between gap-3 p-3 ${isEditing ? 'items-start' : 'items-center'} ${index !== changedFields.length - 1 ? 'border-b border-neutral' : ''}`}
                  >
                    {isEditing ? (
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <div className="min-w-0 flex-1">
                          <InputText
                            name={`${field.id}-override`}
                            label={field.label}
                            value={overrideValues[field.id] ?? defaultValues[field.id] ?? ''}
                            onChange={(event) =>
                              setOverrideValues((previous) => ({
                                ...previous,
                                [field.id]: event.target.value || null,
                              }))
                            }
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          color="neutral"
                          size="lg"
                          iconOnly
                          className="h-12 w-12"
                          aria-label={`Save ${field.label}`}
                          onClick={() => setEditingFieldId(null)}
                        >
                          <Icon iconName="floppy-disk" iconStyle="regular" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="min-w-0 flex-1">
                          <p className="text-ssm text-neutral">{field.label}</p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-ssm text-neutral-subtle">
                            <div className="flex items-center gap-1.5">
                              <span>Default:</span>
                              <code className="rounded bg-surface-neutral-component px-1.5 py-0.5 font-mono text-2xs text-neutral">
                                {field.currentValue}
                              </code>
                              <Icon iconName="arrow-right" iconStyle="regular" className="text-xs" />
                              <code className="rounded bg-surface-neutral-component px-1.5 py-0.5 font-mono text-2xs text-neutral">
                                {defaultValues[field.id]}
                              </code>
                            </div>
                            {hasOverride ? (
                              <div className="flex items-center gap-1.5">
                                <span>Override:</span>
                                <code className="rounded border border-info-subtle bg-surface-info-component px-1.5 py-0.5 font-mono text-2xs text-info">
                                  {overrideValues[field.id]}
                                </code>
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          {hasOverride ? (
                            <Button
                              type="button"
                              variant="outline"
                              color="neutral"
                              size="xs"
                              iconOnly
                              aria-label={`Reset ${field.label} override`}
                              onClick={() => setOverrideValues((previous) => ({ ...previous, [field.id]: null }))}
                            >
                              <Icon iconName="rotate-left" iconStyle="regular" className="text-xs" />
                            </Button>
                          ) : null}
                          <Button
                            type="button"
                            variant="outline"
                            color="neutral"
                            size="xs"
                            iconOnly
                            aria-label={`Edit ${field.label}`}
                            onClick={() => setEditingFieldId(field.id)}
                          >
                            <Icon iconName="pen" iconStyle="regular" className="text-xs" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )
              })
            ) : (
              <p className="p-3 text-sm text-neutral-subtle">No default values were modified in this update.</p>
            )}
          </div>
          {renderContinueButton()}
        </>
      )
    }

    return (
      <div className="rounded-md border border-neutral bg-surface-neutral-subtle">
        {removedFields.length > 0 ? (
          removedFields.map((field, index) => (
            <div
              key={field.id}
              className={`flex items-center justify-between gap-3 p-3 ${index !== removedFields.length - 1 ? 'border-b border-neutral' : ''}`}
            >
              <p className="text-sm text-neutral">{field.label}</p>
              {field.currentValue ? (
                <div className="flex items-center gap-1.5 text-sm text-neutral-subtle">
                  <span>Default:</span>
                  <code className="rounded bg-surface-neutral-component px-1.5 py-0.5 font-mono text-2xs text-neutral">
                    {field.currentValue}
                  </code>
                  <Icon iconName="arrow-right" iconStyle="regular" className="text-xs" />
                  <Badge size="sm" color="red" variant="surface">
                    Deleted
                  </Badge>
                </div>
              ) : (
                <Badge size="sm" color="red" variant="surface">
                  Deleted
                </Badge>
              )}
            </div>
          ))
        ) : (
          <p className="p-3 text-sm text-neutral-subtle">No values were removed in this version.</p>
        )}
      </div>
    )
  }

  return (
    <FunnelFlow
      onExit={onBack}
      totalSteps={1}
      currentStep={1}
      currentTitle="Review & update"
    >
      <div className="mx-auto flex h-full min-h-0 w-full max-w-[620px] flex-col text-sm">
        <Section className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-6">
          <div className="flex flex-col gap-6 pb-6">
            <div className="flex flex-col gap-2">
              <Heading className="text-2xl">
                {blueprintName} blueprint update to {targetVersion}
              </Heading>
              <p className="text-base text-neutral-subtle">
                Review these changes before updating your blueprint to the latest version.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {REVIEW_STEPS.map((step, index) => {
                if (index !== currentStepIndex) {
                  return renderCollapsedStepCard(step, completedStepIds.has(step.id), false)
                }

                return (
                  <div key={step.id} className={REVIEW_CARD_CLASSNAME}>
                    <div className="flex items-center gap-2 p-4">
                      <Icon iconName={step.iconName} iconStyle="regular" className="text-sm text-neutral-subtle" />
                      <p className="text-base font-medium text-neutral">{step.title}</p>
                    </div>

                    <div className="flex flex-col gap-4 px-4 pb-4">
                      {step.description ? <p className="text-sm text-neutral-subtle">{step.description}</p> : null}
                      {renderStepContent()}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Section>
        <div className="shrink-0 border-t border-neutral pb-6 pt-4">
          <Button
            size="lg"
            color="brand"
            variant="solid"
            radius="rounded"
            disabled={!canConfirmDeploy}
            onClick={onDeploy}
            className="w-full justify-center"
          >
            Deploy update
            <Icon iconName="arrow-right" iconStyle="regular" className="ml-1.5" />
          </Button>
        </div>
      </div>
    </FunnelFlow>
  )
}

export default BlueprintUpdateReview
