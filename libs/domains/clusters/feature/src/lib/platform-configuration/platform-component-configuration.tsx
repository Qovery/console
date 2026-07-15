import {
  type PlatformComponentConfigurationResolutionResponse,
  type PlatformTemplateComponentResponse,
} from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import {
  Badge,
  Button,
  Callout,
  CatalogVariableInput,
  type CatalogVariableValue,
  Heading,
  Icon,
} from '@qovery/shared/ui'
import {
  formatCatalogKey,
  getCatalogFieldValidationError,
  getCatalogVariableValue,
  isCatalogFieldValueFulfilled,
} from '@qovery/shared/util-js'
import {
  getFieldViolation,
  getUnmappedViolations,
  isPlatformConfigurationReady,
  toCatalogVariableField,
} from './platform-configuration-utils'

function getLocalFieldValidationError(
  field: ReturnType<typeof toCatalogVariableField>,
  value: CatalogVariableValue | undefined
) {
  const validationError = getCatalogFieldValidationError(field, value)
  if (validationError || typeof value !== 'string' || !value) return validationError
  if (typeof field.min !== 'number' && typeof field.max !== 'number') return undefined

  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return 'Value must be a number.'
  if (
    typeof field.min === 'number' &&
    typeof field.max === 'number' &&
    (numberValue < field.min || numberValue > field.max)
  ) {
    return `Value must be between ${field.min} and ${field.max}.`
  }
  if (typeof field.min === 'number' && numberValue < field.min) return `Value must be at least ${field.min}.`
  if (typeof field.max === 'number' && numberValue > field.max) return `Value must be at most ${field.max}.`
  return undefined
}

interface PlatformComponentConfigurationProps {
  clusterInputs: Record<string, string>
  component: PlatformTemplateComponentResponse
  isFetching: boolean
  isSaving: boolean
  hasPreviewError: boolean
  onClusterInputChange: (key: string, value: CatalogVariableValue) => void
  onProfileConfigChange: (key: string, value: CatalogVariableValue) => void
  onSave: () => void
  preview?: PlatformComponentConfigurationResolutionResponse
  profileConfig: Record<string, unknown>
  validationMode?: 'local' | 'resolver'
}

function RequirementStatus({ status }: { status: 'MISSING' | 'READY' }) {
  return match(status)
    .with('READY', () => null)
    .with('MISSING', () => (
      <Badge size="sm" variant="surface" color="yellow">
        Action required
      </Badge>
    ))
    .exhaustive()
}

export function PlatformComponentConfiguration({
  clusterInputs,
  component,
  hasPreviewError,
  isFetching,
  isSaving,
  onClusterInputChange,
  onProfileConfigChange,
  onSave,
  preview,
  profileConfig,
  validationMode = 'resolver',
}: PlatformComponentConfigurationProps) {
  const fields = preview?.fields ?? component.fields
  const requirements = preview?.requirements ?? []
  const violations = preview?.violations ?? []
  const unmappedViolations = getUnmappedViolations(violations, fields, requirements)
  const localValidationErrors = new Map(
    validationMode === 'local'
      ? fields.flatMap((field) => {
          const catalogField = toCatalogVariableField(field)
          const value = getCatalogVariableValue(field, profileConfig[field.key])
          const error =
            catalogField.required && !isCatalogFieldValueFulfilled(value)
              ? `${catalogField.label} is required.`
              : getLocalFieldValidationError(catalogField, value)
          return error ? [[field.key, error] as const] : []
        })
      : []
  )
  const ready = preview
    ? isPlatformConfigurationReady(violations, requirements)
    : validationMode === 'local' && localValidationErrors.size === 0

  return (
    <div className="rounded-lg border border-neutral bg-surface-neutral p-5">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <Heading level={2}>{formatCatalogKey(component.key)}</Heading>
          {component.description ? <p className="mt-1 text-sm text-neutral-subtle">{component.description}</p> : null}
        </div>
        {isFetching ? (
          <Badge size="sm" variant="surface" color="neutral">
            Checking…
          </Badge>
        ) : (preview || validationMode === 'local') && !ready ? (
          <Badge size="sm" variant="surface" color="yellow">
            Action required
          </Badge>
        ) : null}
      </div>

      {!isFetching && !hasPreviewError && fields.length === 0 && requirements.length === 0 ? (
        <Callout.Root color="neutral">
          <Callout.Icon>
            <Icon iconName="circle-info" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text>This component does not require any configuration.</Callout.Text>
        </Callout.Root>
      ) : (
        <div className="flex flex-col gap-4">
          {hasPreviewError ? (
            <Callout.Root color="red">
              <Callout.Icon>
                <Icon iconName="circle-exclamation" iconStyle="regular" />
              </Callout.Icon>
              <Callout.Text>
                <Callout.TextHeading>Configuration could not be checked</Callout.TextHeading>
                <Callout.TextDescription>Refresh the page and try again.</Callout.TextDescription>
              </Callout.Text>
            </Callout.Root>
          ) : null}

          {fields.length > 0 ? (
            <section className="flex flex-col gap-3">
              <Heading level={3}>Configuration</Heading>
              {fields.map((field) => (
                <CatalogVariableInput
                  key={field.key}
                  booleanControl="checkbox"
                  field={toCatalogVariableField(field)}
                  value={getCatalogVariableValue(field, profileConfig[field.key])}
                  error={getFieldViolation(violations, field.key) ?? localValidationErrors.get(field.key)}
                  onChange={(value) => onProfileConfigChange(field.key, value)}
                />
              ))}
            </section>
          ) : null}

          {requirements.length > 0 ? (
            <section className="flex flex-col gap-3 border-t border-neutral pt-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Heading level={3}>Cluster inputs</Heading>
                  <p className="mt-1 text-ssm text-neutral-subtle">
                    Values required from this cluster for the selected configuration.
                  </p>
                </div>
              </div>
              {requirements.map((requirement) => (
                <div key={requirement.key} className="flex flex-col gap-2">
                  <div className="flex justify-end">
                    <RequirementStatus status={requirement.status} />
                  </div>
                  <CatalogVariableInput
                    booleanControl="checkbox"
                    field={toCatalogVariableField(requirement)}
                    value={clusterInputs[requirement.key]}
                    error={getFieldViolation(violations, requirement.key, 'clusterInputs')}
                    onChange={(value) => onClusterInputChange(requirement.key, value)}
                  />
                </div>
              ))}
            </section>
          ) : null}

          {preview?.componentBindings.length ? (
            <Callout.Root color="sky">
              <Callout.Icon>
                <Icon iconName="link" iconStyle="regular" />
              </Callout.Icon>
              <Callout.Text>
                <Callout.TextHeading>Managed component bindings</Callout.TextHeading>
                <Callout.TextDescription>
                  <ul className="mt-1 list-inside list-disc">
                    {preview.componentBindings.map((binding) => (
                      <li key={`${binding.input}-${binding.fromComponent}-${binding.output}`}>
                        {formatCatalogKey(binding.input)} from {formatCatalogKey(binding.fromComponent)} (
                        {formatCatalogKey(binding.output)})
                      </li>
                    ))}
                  </ul>
                </Callout.TextDescription>
              </Callout.Text>
            </Callout.Root>
          ) : null}

          {unmappedViolations.map((violation) => (
            <Callout.Root key={`${violation.code}-${violation.fieldPath}`} color="red">
              <Callout.Icon>
                <Icon iconName="circle-exclamation" iconStyle="regular" />
              </Callout.Icon>
              <Callout.Text>
                <Callout.TextHeading>{formatCatalogKey(violation.code)}</Callout.TextHeading>
                <Callout.TextDescription>{violation.message}</Callout.TextDescription>
              </Callout.Text>
            </Callout.Root>
          ))}
        </div>
      )}

      <div className="mt-6 flex justify-end border-t border-neutral pt-4">
        <Button
          type="button"
          size="lg"
          loading={isSaving}
          disabled={
            validationMode === 'local'
              ? fields.length > 0 && !ready
              : !preview || isFetching || hasPreviewError || !ready
          }
          onClick={onSave}
        >
          Save configuration
        </Button>
      </div>
    </div>
  )
}
