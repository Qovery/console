import { useState } from 'react'
import { Accordion, Badge, Button, Callout, Heading, Icon, InputText, Section } from '@qovery/shared/ui'

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
    placeholder: 'arn:aws:sns:us-east-1:123456789012:my-topic',
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
    isUserOverride: false,
  },
  {
    id: 'cors_allowed_origins',
    label: 'CORS allowed origins',
    category: 'Config',
    currentValue: 'https://app.acme.com',
    newDefault: '(empty)',
    isUserOverride: true,
  },
  {
    id: 'versioning',
    label: 'Versioning',
    category: 'Config',
    currentValue: 'enabled',
    newDefault: 'suspended',
    isUserOverride: true,
  },
]

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
    defaultValue: '',
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

// ─── Component ───────────────────────────────────────────────────────────────

export function BlueprintUpdateReview({
  blueprintName,
  currentVersion,
  targetVersion,
  releaseNotesUrl,
  requiredInputs,
  changedFields,
  addedFields,
  removedFields,
  onBack,
  onDeploy,
  onDeployWithPreview,
}: BlueprintUpdateReviewProps) {
  const [inputValues, setInputValues] = useState<Record<string, string>>({})
  const [additionValues, setAdditionValues] = useState<Record<string, string>>(
    Object.fromEntries(addedFields.map((f) => [f.id, f.defaultValue]))
  )
  const [revertedFields, setRevertedFields] = useState<Set<string>>(new Set())

  const isDeployEnabled = requiredInputs.every((f) => Boolean(inputValues[f.id]?.trim()))
  const hasDestructiveRemoves = removedFields.some((f) => f.isDestructive)

  const handleRevert = (fieldId: string) => {
    setRevertedFields((prev) => new Set(prev).add(fieldId))
  }

  return (
    <Section className="flex min-h-0 flex-1 flex-col gap-0">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[720px] px-6 py-8">
          {/* ── Header ── */}
          <div className="mb-8">
            <Heading className="mb-1 text-2xl">Update to v{targetVersion}</Heading>
            <p className="text-sm text-neutral-subtle">
              Deploying {blueprintName} · v{currentVersion}{' → '}v{targetVersion}
            </p>
            {releaseNotesUrl && (
              <a
                href={releaseNotesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-sm text-neutral-subtle underline decoration-neutral-component underline-offset-2 hover:text-neutral"
              >
                View release notes
                <Icon iconName="arrow-up-right-from-square" iconStyle="regular" className="text-xs" />
              </a>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {/* ── Required inputs (blocking) ── */}
            {requiredInputs.length > 0 && (
              <Section>
                <div className="overflow-hidden rounded-lg border border-neutral">
                  <div className="flex items-start gap-3 border-b border-neutral bg-surface-neutral-subtle px-4 py-3">
                    <Icon iconName="circle-exclamation" iconStyle="regular" className="mt-0.5 shrink-0 text-sm text-neutral" />
                    <div className="min-w-0">
                      <p className="font-medium text-neutral">Required inputs</p>
                      <p className="mt-0.5 text-xs text-neutral-subtle">
                        These new fields must be filled before you can deploy.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 p-4">
                    {requiredInputs.map((field) => (
                      <InputText
                        key={field.id}
                        name={field.id}
                        label={field.label}
                        placeholder={field.placeholder}
                        hint={field.helper}
                        value={inputValues[field.id] ?? ''}
                        onChange={(e) => setInputValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                      />
                    ))}
                  </div>
                </div>
              </Section>
            )}

            {/* ── Changes ── */}
            {changedFields.length > 0 && (
              <Section>
                <div className="overflow-hidden rounded-lg border border-neutral">
                  <div className="flex items-center gap-2 border-b border-neutral bg-surface-neutral-subtle px-4 py-2">
                    <Badge size="sm" color="neutral" variant="surface">
                      ~ Changed
                    </Badge>
                    <span className="text-xs text-neutral-subtle">{changedFields.length} changed</span>
                  </div>
                  <div className="divide-y divide-neutral">
                    {changedFields.map((field) => {
                      const isReverted = revertedFields.has(field.id)
                      return (
                        <div key={field.id} className="flex items-start justify-between gap-4 px-4 py-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm text-neutral">{field.label}</span>
                              <span className="text-xs text-neutral-subtle">{field.category}</span>
                              {field.isUserOverride && !isReverted && (
                                <Badge size="sm" color="yellow" variant="surface">
                                  Override preserved
                                </Badge>
                              )}
                            </div>
                            <div className="mt-1.5 flex items-center gap-2 text-xs">
                              <code className={`rounded bg-surface-neutral-component px-1.5 py-0.5 text-neutral ${isReverted ? 'line-through opacity-50' : ''}`}>
                                {field.currentValue}
                              </code>
                              <Icon iconName="arrow-right" iconStyle="regular" className="shrink-0 text-xs text-neutral-subtle" />
                              <code className="rounded bg-surface-neutral-component px-1.5 py-0.5 text-neutral">
                                {field.newDefault}
                              </code>
                            </div>
                          </div>
                          {field.isUserOverride && !isReverted && (
                            <button
                              type="button"
                              onClick={() => handleRevert(field.id)}
                              className="shrink-0 text-xs text-neutral-subtle underline decoration-neutral-component underline-offset-2 hover:text-neutral"
                            >
                              Reset to default
                            </button>
                          )}
                          {isReverted && (
                            <span className="shrink-0 text-xs text-neutral-subtle">Reverted</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </Section>
            )}

            {/* ── Additions (collapsed) ── */}
            {addedFields.length > 0 && (
              <Section>
                <Accordion.Root type="single" collapsible className="overflow-hidden rounded-lg border border-neutral">
                  <Accordion.Item value="additions" className="mt-0 rounded-none first:rounded-none last:rounded-none">
                    <Accordion.Trigger className="w-full justify-start gap-3 bg-surface-neutral-subtle px-4 py-2 text-left">
                      <div className="flex items-center gap-2">
                        <Badge size="sm" color="green" variant="surface">
                          + Added
                        </Badge>
                        <span className="text-xs text-neutral-subtle">
                          {addedFields.length} new field{addedFields.length !== 1 && 's'} with defaults
                        </span>
                      </div>
                    </Accordion.Trigger>
                    <Accordion.Content>
                      <div className="flex flex-col gap-4 border-t border-neutral p-4">
                        {addedFields.map((field) => (
                          <div key={field.id}>
                            <div className="mb-1">
                              <span className="text-xs text-neutral-subtle">{field.category}</span>
                            </div>
                            <InputText
                              name={field.id}
                              label={field.label}
                              hint={field.helper}
                              value={additionValues[field.id] ?? ''}
                              onChange={(e) =>
                                setAdditionValues((prev) => ({ ...prev, [field.id]: e.target.value }))
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </Accordion.Content>
                  </Accordion.Item>
                </Accordion.Root>
              </Section>
            )}

            {/* ── Removes (collapsed) ── */}
            {removedFields.length > 0 && (
              <Section>
                {hasDestructiveRemoves && (
                  <div className="mb-3">
                    <Callout.Root color="red">
                      <Callout.Icon>
                        <Icon iconName="triangle-exclamation" iconStyle="regular" />
                      </Callout.Icon>
                      <Callout.Text>
                        <Callout.TextHeading>Destructive removals</Callout.TextHeading>
                        <Callout.TextDescription>
                          {removedFields.filter((f) => f.isDestructive).length} resource
                          {removedFields.filter((f) => f.isDestructive).length !== 1 && 's'} will be permanently
                          destroyed when you deploy. This cannot be undone.
                        </Callout.TextDescription>
                      </Callout.Text>
                    </Callout.Root>
                  </div>
                )}
                <Accordion.Root type="single" collapsible className="overflow-hidden rounded-lg border border-neutral">
                  <Accordion.Item value="removes" className="mt-0 rounded-none first:rounded-none last:rounded-none">
                    <Accordion.Trigger className="w-full justify-start gap-3 bg-surface-neutral-subtle px-4 py-2 text-left">
                      <div className="flex items-center gap-2">
                        <Badge size="sm" color="red" variant="surface">
                          − Removed
                        </Badge>
                        <span className="text-xs text-neutral-subtle">{removedFields.length} removed</span>
                        {hasDestructiveRemoves && (
                          <Badge size="sm" color="red" variant="surface">
                            <Icon iconName="triangle-exclamation" iconStyle="regular" className="mr-1 text-xs" />
                            Destructive
                          </Badge>
                        )}
                      </div>
                    </Accordion.Trigger>
                    <Accordion.Content>
                      <div className="divide-y divide-neutral border-t border-neutral">
                        {removedFields.map((field) => (
                          <div key={field.id} className="flex items-start justify-between gap-4 px-4 py-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`text-sm ${field.isDestructive ? 'text-negative' : 'text-neutral'}`}>
                                  {field.label}
                                </span>
                                <span className="text-xs text-neutral-subtle">{field.category}</span>
                                {field.isDestructive && (
                                  <Badge size="sm" color="red" variant="surface">
                                    Destructive
                                  </Badge>
                                )}
                              </div>
                              {field.currentValue && (
                                <div className="mt-1.5">
                                  <code className={`rounded px-1.5 py-0.5 text-xs line-through ${field.isDestructive ? 'bg-surface-error-subtle text-negative' : 'bg-surface-neutral-component text-neutral-subtle'}`}>
                                    {field.currentValue}
                                  </code>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Accordion.Content>
                  </Accordion.Item>
                </Accordion.Root>
              </Section>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="shrink-0 border-t border-neutral bg-background px-6 py-4">
        <div className="mx-auto flex max-w-[720px] items-center justify-between gap-3">
          <Button size="lg" color="neutral" variant="surface" onClick={onBack}>
            Cancel
          </Button>
          <div className="flex items-center gap-2">
            <Button size="lg" color="neutral" variant="surface" disabled={!isDeployEnabled} onClick={onDeployWithPreview}>
              <Icon iconName="eye" iconStyle="regular" className="mr-1.5" />
              Deploy with preview
            </Button>
            <Button size="lg" color="brand" variant="solid" radius="rounded" disabled={!isDeployEnabled} onClick={onDeploy}>
              Deploy
              <Icon iconName="rocket" iconStyle="regular" className="ml-1.5" />
            </Button>
          </div>
        </div>
      </div>
    </Section>
  )
}

export default BlueprintUpdateReview
