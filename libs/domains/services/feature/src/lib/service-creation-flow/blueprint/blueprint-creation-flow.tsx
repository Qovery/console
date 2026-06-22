import { type IconName } from '@fortawesome/fontawesome-common-types'
import { useParams } from '@tanstack/react-router'
import {
  type BlueprintItem,
  type BlueprintManifestContextVariableField,
  type BlueprintManifestResponseResultsInner,
  type BlueprintManifestVariableField,
} from 'qovery-typescript-axios'
import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { Button, Checkbox, FunnelFlow, Icon, InputSelect, InputText } from '@qovery/shared/ui'
import { useBlueprintCatalogServiceManifest } from '../../hooks/use-blueprint-catalog-service-manifest/use-blueprint-catalog-service-manifest'

export interface BlueprintCreationFlowProps {
  blueprint: BlueprintItem
  organizationId: string
  onExit: () => void
}

const steps = ['Configuration', 'Preview changes']

type BlueprintConfigurationSection = 'service-information' | 'blueprint-setup' | 'overrides'
type BlueprintFieldValue = string | boolean
type BlueprintFieldValues = Record<string, BlueprintFieldValue>
type OverridableBlueprintManifestContextVariableField = BlueprintManifestContextVariableField & {
  overridable?: boolean
}

function formatFieldLabel(name: string) {
  const label = name.replace(/_/g, ' ')
  return `${label.charAt(0).toUpperCase()}${label.slice(1)}`
}

function getDefaultFieldValue(field: BlueprintManifestVariableField): BlueprintFieldValue {
  if (field.type.type === 'bool') return field.default_value === 'true'
  return field.default_value ?? ''
}

function getDefaultContextFieldValue(field: BlueprintManifestContextVariableField): BlueprintFieldValue {
  return field.value ?? ''
}

function getStringFieldValue(value: BlueprintFieldValue | undefined) {
  return typeof value === 'string' ? value : ''
}

function getBooleanFieldValue(value: BlueprintFieldValue | undefined) {
  return typeof value === 'boolean' ? value : false
}

function isFieldValueFulfilled(value: BlueprintFieldValue | undefined) {
  if (typeof value === 'boolean') return true
  return Boolean(value?.trim())
}

function isFieldValueMatchingPattern(field: BlueprintManifestVariableField, value: BlueprintFieldValue | undefined) {
  if (typeof value !== 'string' || !value || !field.type.pattern) return true

  try {
    return new RegExp(field.type.pattern).test(value)
  } catch {
    return true
  }
}

function getFieldLengthValidationError(field: BlueprintManifestVariableField, value: BlueprintFieldValue | undefined) {
  if (typeof value !== 'string' || !value) return undefined

  const { min_length: minLength, max_length: maxLength } = field.type
  const hasMinLength = typeof minLength === 'number'
  const hasMaxLength = typeof maxLength === 'number'

  if (hasMinLength && hasMaxLength && (value.length < minLength || value.length > maxLength)) {
    return `Value must be between ${minLength} and ${maxLength} characters.`
  }

  if (hasMinLength && value.length < minLength) return `Value must be at least ${minLength} characters.`
  if (hasMaxLength && value.length > maxLength) return `Value must be at most ${maxLength} characters.`

  return undefined
}

function getFieldValidationError(field: BlueprintManifestVariableField, value: BlueprintFieldValue | undefined) {
  const lengthValidationError = getFieldLengthValidationError(field, value)
  if (lengthValidationError) return lengthValidationError

  if (!isFieldValueMatchingPattern(field, value)) return 'Value does not match the expected format.'
  return undefined
}

function isFieldValid(field: BlueprintManifestVariableField, value: BlueprintFieldValue | undefined) {
  if (field.required && !isFieldValueFulfilled(value)) return false
  return !getFieldValidationError(field, value)
}

function isVariableField(field: BlueprintManifestResponseResultsInner): field is BlueprintManifestVariableField {
  return field.kind === 'variable'
}

function isRequiredVariableField(
  field: BlueprintManifestResponseResultsInner
): field is BlueprintManifestVariableField {
  return isVariableField(field) && field.required
}

function isOptionalVariableField(
  field: BlueprintManifestResponseResultsInner
): field is BlueprintManifestVariableField {
  return isVariableField(field) && !field.required
}

function isOverridableContextVariableField(
  field: BlueprintManifestResponseResultsInner
): field is OverridableBlueprintManifestContextVariableField {
  return field.kind === 'contextVariable' && 'overridable' in field && field.overridable === true
}

function BlueprintSection({
  active = false,
  completed = false,
  iconName,
  onClick,
  title,
  description,
  children,
}: {
  active?: boolean
  completed?: boolean
  iconName: IconName
  onClick?: () => void
  title: string
  description?: string
  children?: ReactNode
}) {
  const isClickable = Boolean(onClick && !active)
  const headerContent = (
    <>
      <div className="flex items-center gap-2">
        <Icon iconName={iconName} className="text-sm text-neutral-subtle" />
        <h2
          className={`text-base font-medium leading-6 ${active || completed ? 'text-neutral' : 'text-neutral-subtle'}`}
        >
          {title}
        </h2>
        {description && (
          <>
            <span className="h-1 w-1 rounded-full bg-surface-neutral-component" aria-hidden="true" />
            <p className="text-sm leading-5 text-neutral-subtle">{description}</p>
          </>
        )}
      </div>
      {completed && <Icon iconName="circle-check" className="text-sm text-positive" />}
    </>
  )

  return (
    <section className="rounded-xl border border-neutral bg-surface-neutral shadow-sm">
      {isClickable ? (
        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 rounded-t-xl px-4 py-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-strong"
          aria-expanded={active}
          onClick={onClick}
        >
          {headerContent}
        </button>
      ) : (
        <div className="flex items-center justify-between gap-3 px-4 py-4">{headerContent}</div>
      )}
      {children && <div className="flex flex-col gap-3 px-4 pb-4">{children}</div>}
    </section>
  )
}

function CheckboxField({
  checked,
  children,
  description,
  label,
  name,
  onChange,
}: {
  checked: boolean
  children?: ReactNode
  description: string
  label: string
  name: string
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="rounded-md border border-neutral bg-surface-neutral px-3 py-3">
      <div className="flex items-center gap-2">
        <Checkbox
          name={name}
          id={name}
          checked={checked}
          onCheckedChange={(checked) => {
            if (checked === 'indeterminate') return
            onChange(checked)
          }}
        />
        <label htmlFor={name} className="cursor-pointer text-sm leading-5 text-neutral">
          {label}
        </label>
      </div>
      <p className="mt-1 pl-6 text-ssm leading-[18px] text-neutral-subtle">{description}</p>
      {children}
    </div>
  )
}

// TODO: needs to be refactored. Make sure everything is super type-safe, using ts-pattern's `exhaustive` function
function BlueprintManifestVariableInput({
  error,
  field,
  onChange,
  value,
}: {
  error?: string
  field: BlueprintManifestVariableField
  onChange: (value: BlueprintFieldValue) => void
  value: BlueprintFieldValue | undefined
}) {
  const label = formatFieldLabel(field.name)

  if (field.allowed_values?.length) {
    return (
      <InputSelect
        label={label}
        value={getStringFieldValue(value)}
        options={field.allowed_values.map((allowedValue) => ({ label: allowedValue, value: allowedValue }))}
        onChange={(value) => {
          if (Array.isArray(value)) return
          onChange(value)
        }}
      />
    )
  }

  if (field.type.type === 'bool') {
    return (
      <CheckboxField
        checked={getBooleanFieldValue(value)}
        description={field.description ?? ''}
        label={label}
        name={field.name}
        onChange={onChange}
      />
    )
  }

  return (
    <InputText
      name={field.name}
      label={label}
      type={field.type.type === 'number' ? 'number' : field.is_secret ? 'password' : 'text'}
      value={getStringFieldValue(value)}
      error={error}
      hint={field.description ?? undefined}
      onChange={(event) => onChange(event.currentTarget.value)}
    />
  )
}

function OverridesSection({
  active,
  children,
  onClick,
}: {
  active: boolean
  children?: ReactNode
  onClick: () => void
}) {
  if (!active) {
    return <BlueprintSection iconName="code" title="Overrides" description="For advanced users" onClick={onClick} />
  }

  return (
    <section className="rounded-xl border border-neutral bg-surface-neutral shadow-sm">
      <div className="flex flex-col gap-1 px-4 py-4">
        <div className="flex items-center gap-2">
          <Icon iconName="code" className="text-sm text-neutral-subtle" />
          <h2 className="text-base font-medium leading-6 text-neutral">Overrides</h2>
          <span className="h-1 w-1 rounded-full bg-surface-neutral-component" aria-hidden="true" />
          <p className="text-sm leading-5 text-neutral-subtle">For advanced users</p>
        </div>
        <p className="text-sm leading-5 text-neutral-subtle">
          Use overrides to customize how your service is built or run. Entirely optional.
        </p>
      </div>

      {children && <div className="flex flex-col gap-3 px-4 pb-4">{children}</div>}
    </section>
  )
}

export function BlueprintCreationFlow({ blueprint, organizationId, onExit }: BlueprintCreationFlowProps) {
  const [serviceName, setServiceName] = useState(blueprint.name)
  const [blueprintFieldValues, setBlueprintFieldValues] = useState<BlueprintFieldValues>({})
  const [currentSection, setCurrentSection] = useState<BlueprintConfigurationSection>('service-information')
  const serviceVersion = blueprint.majorVersions[0]?.serviceVersion ?? 'latest'
  const serviceFamily = blueprint.serviceFamily ?? ''
  const { environmentId = '' } = useParams({ strict: false })
  const { data: blueprintManifestFields = [] } = useBlueprintCatalogServiceManifest({
    organizationId,
    provider: blueprint.provider,
    serviceFamily,
    serviceVersion,
    environmentId,
    enabled: Boolean(serviceVersion) && Boolean(serviceFamily) && Boolean(environmentId),
  })

  const requiredBlueprintFields = useMemo(
    () => blueprintManifestFields.filter(isRequiredVariableField),
    [blueprintManifestFields]
  )
  const optionalBlueprintFields = useMemo(
    () => blueprintManifestFields.filter(isOptionalVariableField),
    [blueprintManifestFields]
  )
  const overridableContextBlueprintFields = useMemo(
    () => blueprintManifestFields.filter(isOverridableContextVariableField),
    [blueprintManifestFields]
  )
  const hasOverrideFields = optionalBlueprintFields.length > 0 || overridableContextBlueprintFields.length > 0
  const isBlueprintSetupValid = requiredBlueprintFields.every((field) =>
    isFieldValid(field, blueprintFieldValues[field.name])
  )

  useEffect(() => {
    if (blueprintManifestFields.length) {
      console.log('Blueprint service manifest', blueprintManifestFields)
    }
  }, [blueprintManifestFields])

  // TODO: refactor this. That does not look good. Should use react-hook-form
  useEffect(() => {
    const fieldsWithDefaultValue = [...requiredBlueprintFields, ...optionalBlueprintFields]
    if (!fieldsWithDefaultValue.length && !overridableContextBlueprintFields.length) return

    setBlueprintFieldValues((currentValues) => {
      let hasNewDefaultValue = false
      const nextValues = { ...currentValues }

      fieldsWithDefaultValue.forEach((field) => {
        if (nextValues[field.name] !== undefined) return

        nextValues[field.name] = getDefaultFieldValue(field)
        hasNewDefaultValue = true
      })

      overridableContextBlueprintFields.forEach((field) => {
        if (nextValues[field.name] !== undefined) return

        nextValues[field.name] = getDefaultContextFieldValue(field)
        hasNewDefaultValue = true
      })

      return hasNewDefaultValue ? nextValues : currentValues
    })
  }, [optionalBlueprintFields, overridableContextBlueprintFields, requiredBlueprintFields])

  return (
    <FunnelFlow totalSteps={steps.length} currentStep={1} currentTitle={steps[0]} onExit={onExit}>
      <div className="flex w-full items-start overflow-auto bg-background">
        <main className="mx-auto flex w-full max-w-[620px] flex-col justify-between px-4 pt-6">
          <div>
            <header className="mb-5">
              <h1 className="text-2xl font-medium leading-8 text-neutral">{blueprint.name} configuration</h1>
              <p className="mt-1 text-sm leading-5 text-neutral-subtle">
                Provisioned from{' '}
                <button type="button" className="font-normal underline" onClick={onExit}>
                  {blueprint.name}
                </button>{' '}
                blueprint
              </p>
            </header>

            <div className="flex flex-col gap-3 pb-24">
              <BlueprintSection
                active={currentSection === 'service-information'}
                completed={currentSection !== 'service-information'}
                iconName="circle-info"
                title="Service informations"
                onClick={() => setCurrentSection('service-information')}
              >
                {currentSection === 'service-information' && (
                  <>
                    <InputText
                      name="service-name"
                      label="Service name"
                      value={serviceName}
                      onChange={(event) => setServiceName(event.currentTarget.value)}
                      autoFocus
                    />
                    <InputText name="blueprint-version" label="Blueprint version" value={serviceVersion} disabled />
                    <Button
                      type="button"
                      size="md"
                      color="neutral"
                      className="w-fit"
                      onClick={() => setCurrentSection('blueprint-setup')}
                    >
                      Continue
                      <Icon iconName="arrow-right" />
                    </Button>
                  </>
                )}
              </BlueprintSection>

              <BlueprintSection
                active={currentSection === 'blueprint-setup'}
                completed={currentSection === 'overrides'}
                iconName="chart-bullet"
                title="Blueprint setup"
                onClick={() => setCurrentSection('blueprint-setup')}
              >
                {currentSection === 'blueprint-setup' && (
                  <>
                    {requiredBlueprintFields.map((field) => (
                      <BlueprintManifestVariableInput
                        key={field.name}
                        error={getFieldValidationError(field, blueprintFieldValues[field.name])}
                        field={field}
                        value={blueprintFieldValues[field.name]}
                        onChange={(value) =>
                          setBlueprintFieldValues((currentValues) => ({
                            ...currentValues,
                            [field.name]: value,
                          }))
                        }
                      />
                    ))}
                    <Button
                      type="button"
                      size="md"
                      color="neutral"
                      className="w-fit"
                      disabled={!isBlueprintSetupValid}
                      onClick={() => setCurrentSection('overrides')}
                    >
                      Continue
                      <Icon iconName="arrow-right" />
                    </Button>
                  </>
                )}
              </BlueprintSection>
              <OverridesSection active={currentSection === 'overrides'} onClick={() => setCurrentSection('overrides')}>
                {hasOverrideFields && (
                  <>
                    {optionalBlueprintFields.map((field) => (
                      <BlueprintManifestVariableInput
                        key={field.name}
                        error={getFieldValidationError(field, blueprintFieldValues[field.name])}
                        field={field}
                        value={blueprintFieldValues[field.name]}
                        onChange={(value) =>
                          setBlueprintFieldValues((currentValues) => ({
                            ...currentValues,
                            [field.name]: value,
                          }))
                        }
                      />
                    ))}
                    {overridableContextBlueprintFields.map((field) => (
                      <InputText
                        key={field.name}
                        name={field.name}
                        label={formatFieldLabel(field.name)}
                        value={getStringFieldValue(blueprintFieldValues[field.name])}
                        hint={field.source ? `Automatically sourced from ${field.source}` : undefined}
                        onChange={(event) =>
                          setBlueprintFieldValues((currentValues) => ({
                            ...currentValues,
                            [field.name]: event.currentTarget.value,
                          }))
                        }
                      />
                    ))}
                  </>
                )}
              </OverridesSection>
            </div>
          </div>

          <footer className="fixed bottom-0 left-1/2 z-10 w-full max-w-[620px] -translate-x-1/2 border-t border-neutral bg-background px-4 py-4">
            <Button type="button" size="lg" className="w-full" disabled={currentSection !== 'overrides'}>
              Confirm blueprint configuration
              <Icon iconName="arrow-right" />
            </Button>
          </footer>
        </main>
      </div>
    </FunnelFlow>
  )
}

export default BlueprintCreationFlow
