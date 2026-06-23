import { type IconName } from '@fortawesome/fontawesome-common-types'
import { useNavigate, useParams } from '@tanstack/react-router'
import posthog from 'posthog-js'
import {
  type BlueprintItem,
  type BlueprintManifestContextVariableField,
  type BlueprintManifestResponseResultsInner,
  type BlueprintManifestVariableField,
  type BlueprintVariableRequest,
} from 'qovery-typescript-axios'
import {
  type Dispatch,
  type PropsWithChildren,
  type ReactNode,
  type SetStateAction,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { FormProvider, type UseFormReturn, useForm } from 'react-hook-form'
import {
  Button,
  Checkbox,
  FunnelFlow,
  FunnelFlowBody,
  Heading,
  Icon,
  InputSelect,
  InputText,
  Section,
  SummaryValue,
} from '@qovery/shared/ui'
import { useBlueprintCatalogServiceManifest } from '../../hooks/use-blueprint-catalog-service-manifest/use-blueprint-catalog-service-manifest'
import { useCreateBlueprint } from '../../hooks/use-create-blueprint/use-create-blueprint'

export type BlueprintConfigurationSection = 'service-information' | 'blueprint-setup' | 'overrides'
export type BlueprintFieldValue = string | boolean
export type BlueprintFieldValues = Record<string, BlueprintFieldValue>

export interface BlueprintCreateFormData {
  serviceName: string
  fields: BlueprintFieldValues
}

type OverridableBlueprintManifestContextVariableField = BlueprintManifestContextVariableField & {
  overridable?: boolean
}

export interface BlueprintCreateContextInterface {
  blueprint: BlueprintItem
  organizationId: string
  creationFlowUrl: string
  currentStep: number
  setCurrentStep: Dispatch<SetStateAction<number>>
  form: UseFormReturn<BlueprintCreateFormData>
  serviceVersion: string
  requiredBlueprintFields: BlueprintManifestVariableField[]
  optionalBlueprintFields: BlueprintManifestVariableField[]
  overridableContextBlueprintFields: OverridableBlueprintManifestContextVariableField[]
}

export interface BlueprintCreationFlowProps extends PropsWithChildren {
  blueprint: BlueprintItem
  organizationId: string
  creationFlowUrl: string
  onExit: () => void
}

export const BlueprintCreateContext = createContext<BlueprintCreateContextInterface | undefined>(undefined)

export const useBlueprintCreateContext = () => {
  const blueprintCreateContext = useContext(BlueprintCreateContext)

  if (!blueprintCreateContext) {
    throw new Error('useBlueprintCreateContext must be used within a BlueprintCreateContext')
  }

  return blueprintCreateContext
}

export const blueprintCreationSteps: { title: string }[] = [{ title: 'Configuration' }, { title: 'Summary' }]

type BlueprintFieldPath = `fields.${string}`

function getBlueprintFieldPath(name: string): BlueprintFieldPath {
  return `fields.${name}`
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

function getSummaryFieldValue(
  field: BlueprintManifestVariableField | OverridableBlueprintManifestContextVariableField,
  value: BlueprintFieldValue | undefined
) {
  if (typeof value === 'boolean') return value ? 'Enabled' : 'Disabled'
  if (field.kind === 'variable' && field.is_secret && value) return '••••••••'
  return value
}

function buildBlueprintVariables(
  fields: BlueprintFieldValues,
  blueprintFields: Array<BlueprintManifestVariableField | OverridableBlueprintManifestContextVariableField>
): BlueprintVariableRequest[] {
  const blueprintFieldsByName = new Map(blueprintFields.map((field) => [field.name, field]))

  return Object.entries(fields).flatMap(([name, value]) => {
    if (typeof value === 'string' && !value.trim()) return []
    const field = blueprintFieldsByName.get(name)

    return [
      {
        name,
        value: String(value),
        is_secret: field?.kind === 'variable' ? field.is_secret : false,
      },
    ]
  })
}

function BlueprintSection({
  active = false,
  completed = false,
  disabled = false,
  iconName,
  onClick,
  title,
  description,
  children,
}: {
  active?: boolean
  completed?: boolean
  disabled?: boolean
  iconName: IconName
  onClick?: () => void
  title: string
  description?: string
  children?: ReactNode
}) {
  const isClickable = Boolean(onClick && !active)
  const isDisabled = disabled && isClickable
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
          disabled={isDisabled}
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
  disabled = false,
  onClick,
}: {
  active: boolean
  children?: ReactNode
  disabled?: boolean
  onClick: () => void
}) {
  if (!active) {
    return (
      <BlueprintSection
        disabled={disabled}
        iconName="code"
        title="Overrides"
        description="For advanced users"
        onClick={onClick}
      />
    )
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

export function BlueprintCreationFlow({
  blueprint,
  children,
  creationFlowUrl,
  organizationId,
  onExit,
}: BlueprintCreationFlowProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const serviceVersion = blueprint.majorVersions[0]?.serviceVersion ?? 'latest'
  const serviceFamily = blueprint.serviceFamily ?? ''
  const { environmentId = '' } = useParams({ strict: false })
  const form = useForm<BlueprintCreateFormData>({
    defaultValues: {
      serviceName: blueprint.name,
      fields: {},
    },
    mode: 'onChange',
  })
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

  useEffect(() => {
    const fieldsWithDefaultValue = [...requiredBlueprintFields, ...optionalBlueprintFields]
    if (!fieldsWithDefaultValue.length && !overridableContextBlueprintFields.length) return

    const currentValues = form.getValues('fields')
    const nextValues = { ...currentValues }

    fieldsWithDefaultValue.forEach((field) => {
      if (nextValues[field.name] !== undefined) return

      nextValues[field.name] = getDefaultFieldValue(field)
      form.setValue(getBlueprintFieldPath(field.name), nextValues[field.name], { shouldValidate: true })
    })

    overridableContextBlueprintFields.forEach((field) => {
      if (nextValues[field.name] !== undefined) return

      nextValues[field.name] = getDefaultContextFieldValue(field)
      form.setValue(getBlueprintFieldPath(field.name), nextValues[field.name], { shouldValidate: true })
    })
  }, [form, optionalBlueprintFields, overridableContextBlueprintFields, requiredBlueprintFields])

  return (
    <BlueprintCreateContext.Provider
      value={{
        blueprint,
        organizationId,
        creationFlowUrl,
        currentStep,
        setCurrentStep,
        form,
        serviceVersion,
        requiredBlueprintFields,
        optionalBlueprintFields,
        overridableContextBlueprintFields,
      }}
    >
      <FormProvider {...form}>
        <FunnelFlow
          totalSteps={blueprintCreationSteps.length}
          currentStep={currentStep}
          currentTitle={blueprintCreationSteps[currentStep - 1]?.title}
          onExit={onExit}
        >
          {children}
        </FunnelFlow>
      </FormProvider>
    </BlueprintCreateContext.Provider>
  )
}

export function BlueprintConfigurationStep() {
  const navigate = useNavigate()
  const {
    blueprint,
    creationFlowUrl,
    form,
    optionalBlueprintFields,
    overridableContextBlueprintFields,
    requiredBlueprintFields,
    serviceVersion,
    setCurrentStep,
  } = useBlueprintCreateContext()
  const [currentSection, setCurrentSection] = useState<BlueprintConfigurationSection>('service-information')
  const serviceName = form.watch('serviceName')
  const blueprintFieldValues = form.watch('fields')
  const hasOverrideFields = optionalBlueprintFields.length > 0 || overridableContextBlueprintFields.length > 0
  const isServiceInformationValid = Boolean(serviceName.trim())
  const isBlueprintSetupValid = requiredBlueprintFields.every((field) =>
    isFieldValid(field, blueprintFieldValues[field.name])
  )
  const updateFieldValue = (name: string, value: BlueprintFieldValue) => {
    form.setValue(getBlueprintFieldPath(name), value, { shouldDirty: true, shouldValidate: true })
  }

  useEffect(() => {
    setCurrentStep(1)
  }, [setCurrentStep])

  return (
    <div className="flex w-full items-start overflow-auto bg-background">
      <main className="mx-auto flex w-full max-w-[620px] flex-col justify-between px-4 pt-6">
        <div>
          <header className="mb-5">
            <h1 className="text-2xl font-medium leading-8 text-neutral">{blueprint.name} configuration</h1>
            <p className="mt-1 text-sm leading-5 text-neutral-subtle">
              Provisioned from <span className="font-normal underline">{blueprint.name}</span> blueprint
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
                    onChange={(event) => form.setValue('serviceName', event.currentTarget.value)}
                    autoFocus
                  />
                  <InputText name="blueprint-version" label="Blueprint version" value={serviceVersion} disabled />
                  <Button
                    type="button"
                    size="md"
                    color="neutral"
                    className="w-fit"
                    disabled={!isServiceInformationValid}
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
              disabled={!isServiceInformationValid}
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
                      onChange={(value) => updateFieldValue(field.name, value)}
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
            <OverridesSection
              active={currentSection === 'overrides'}
              disabled={!isBlueprintSetupValid}
              onClick={() => setCurrentSection('overrides')}
            >
              {hasOverrideFields && (
                <>
                  {optionalBlueprintFields.map((field) => (
                    <BlueprintManifestVariableInput
                      key={field.name}
                      error={getFieldValidationError(field, blueprintFieldValues[field.name])}
                      field={field}
                      value={blueprintFieldValues[field.name]}
                      onChange={(value) => updateFieldValue(field.name, value)}
                    />
                  ))}
                  {overridableContextBlueprintFields.map((field) => (
                    <InputText
                      key={field.name}
                      name={field.name}
                      label={formatFieldLabel(field.name)}
                      value={getStringFieldValue(blueprintFieldValues[field.name])}
                      hint={field.source ? `Automatically sourced from ${field.source}` : undefined}
                      onChange={(event) => updateFieldValue(field.name, event.currentTarget.value)}
                    />
                  ))}
                </>
              )}
            </OverridesSection>
          </div>
        </div>

        <footer className="fixed bottom-0 left-1/2 z-10 w-full max-w-[620px] -translate-x-1/2 border-t border-neutral bg-background px-4 py-4">
          <Button
            type="button"
            size="lg"
            className="w-full"
            disabled={currentSection !== 'overrides'}
            onClick={() => navigate({ to: `${creationFlowUrl}/summary` })}
          >
            Confirm blueprint configuration
            <Icon iconName="arrow-right" />
          </Button>
        </footer>
      </main>
    </div>
  )
}

export function BlueprintStepSummary() {
  const navigate = useNavigate()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  const {
    blueprint,
    creationFlowUrl,
    form,
    optionalBlueprintFields,
    overridableContextBlueprintFields,
    requiredBlueprintFields,
    serviceVersion,
    setCurrentStep,
  } = useBlueprintCreateContext()
  const [submitMode, setSubmitMode] = useState<'create' | 'create-and-deploy' | null>(null)
  const { mutateAsync: createBlueprint } = useCreateBlueprint()
  const { fields, serviceName } = form.watch()
  const variableFields = [...requiredBlueprintFields, ...optionalBlueprintFields]
  const overrideFields = [...optionalBlueprintFields, ...overridableContextBlueprintFields]
  const blueprintFields = [...variableFields, ...overridableContextBlueprintFields]

  useEffect(() => {
    setCurrentStep(2)
  }, [setCurrentStep])

  useEffect(() => {
    if (!serviceName.trim()) {
      navigate({ to: creationFlowUrl })
    }
  }, [creationFlowUrl, navigate, serviceName])

  const handleSubmit = async (withDeploy: boolean) => {
    setSubmitMode(withDeploy ? 'create-and-deploy' : 'create')
    const formValues = form.getValues()

    try {
      await createBlueprint({
        environmentId,
        deploy: withDeploy,
        payload: {
          name: formValues.serviceName,
          tag: blueprint.majorVersions[0]?.latestTag ?? '',
          icon: blueprint.icon,
          variables: buildBlueprintVariables(formValues.fields, blueprintFields),
        },
      })

      posthog.capture('create-service', {
        selectedServiceType: 'blueprint',
        selectedServiceSubType: blueprint.serviceFamily ?? blueprint.provider,
      })

      navigate({
        to: '/organization/$organizationId/project/$projectId/environment/$environmentId/overview',
        params: {
          organizationId,
          projectId,
          environmentId,
        },
      })
    } catch {
      // errors are surfaced by mutation notifications
    } finally {
      setSubmitMode(null)
    }
  }

  return (
    <FunnelFlowBody customContentWidth="max-w-[1024px]">
      <Section className="space-y-10">
        <div className="flex flex-col gap-2">
          <Heading className="mb-2">Ready to create your blueprint service</Heading>
          <p className="text-sm text-neutral-subtle">
            Review the configuration generated from the selected blueprint before creating the service.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <Section className="rounded-md border border-neutral bg-surface-neutral-subtle p-4">
            <div className="flex justify-between">
              <Heading>Service information</Heading>
              <Button
                aria-label="Edit service information"
                type="button"
                variant="outline"
                color="neutral"
                size="md"
                onClick={() => navigate({ to: creationFlowUrl })}
                iconOnly
              >
                <Icon className="text-base" iconName="gear-complex" />
              </Button>
            </div>
            <ul className="list-none space-y-2 text-sm text-neutral-subtle">
              <SummaryValue label="Name" value={serviceName} />
              <SummaryValue label="Blueprint" value={blueprint.name} />
              <SummaryValue label="Blueprint version" value={serviceVersion} />
            </ul>
          </Section>

          {requiredBlueprintFields.length > 0 && (
            <Section className="rounded-md border border-neutral bg-surface-neutral-subtle p-4">
              <div className="flex justify-between">
                <Heading>Blueprint setup</Heading>
                <Button
                  aria-label="Edit blueprint setup"
                  type="button"
                  variant="outline"
                  color="neutral"
                  size="md"
                  onClick={() => navigate({ to: creationFlowUrl })}
                  iconOnly
                >
                  <Icon className="text-base" iconName="gear-complex" />
                </Button>
              </div>
              <ul className="list-none space-y-2 text-sm text-neutral-subtle">
                {requiredBlueprintFields.map((field) => (
                  <SummaryValue
                    key={field.name}
                    label={formatFieldLabel(field.name)}
                    value={getSummaryFieldValue(field, fields[field.name])}
                  />
                ))}
              </ul>
            </Section>
          )}

          <Section className="rounded-md border border-neutral bg-surface-neutral-subtle p-4">
            <div className="flex justify-between">
              <Heading>Overrides</Heading>
              <Button
                aria-label="Edit overrides"
                type="button"
                variant="outline"
                color="neutral"
                size="md"
                onClick={() => navigate({ to: creationFlowUrl })}
                iconOnly
              >
                <Icon className="text-base" iconName="gear-complex" />
              </Button>
            </div>
            {overrideFields.length > 0 ? (
              <ul className="list-none space-y-2 text-sm text-neutral-subtle">
                {overrideFields.map((field) => (
                  <SummaryValue
                    key={field.name}
                    label={formatFieldLabel(field.name)}
                    value={getSummaryFieldValue(field, fields[field.name])}
                  />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-neutral-subtle">No overrides configured.</p>
            )}
          </Section>
        </div>

        <div className="flex justify-between">
          <Button onClick={() => navigate({ to: creationFlowUrl })} type="button" size="lg" variant="plain">
            Back
          </Button>
          <div className="flex gap-2">
            <Button
              data-testid="button-create"
              loading={submitMode === 'create'}
              onClick={() => handleSubmit(false)}
              size="lg"
              type="button"
              variant="outline"
            >
              Create
            </Button>
            <Button
              data-testid="button-create-deploy"
              loading={submitMode === 'create-and-deploy'}
              onClick={() => handleSubmit(true)}
              type="button"
              size="lg"
            >
              Create and deploy
            </Button>
          </div>
        </div>
      </Section>
    </FunnelFlowBody>
  )
}

export default BlueprintCreationFlow
