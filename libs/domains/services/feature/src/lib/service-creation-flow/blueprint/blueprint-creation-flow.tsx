import { type IconName } from '@fortawesome/fontawesome-common-types'
import { useParams } from '@tanstack/react-router'
import { type BlueprintItem, type BlueprintManifestVariableField } from 'qovery-typescript-axios'
import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { Button, Checkbox, FunnelFlow, Icon, InputSelect, InputText } from '@qovery/shared/ui'
import { useBlueprintCatalogServiceManifest } from '../../hooks/use-blueprint-catalog-service-manifest/use-blueprint-catalog-service-manifest'

export interface BlueprintCreationFlowProps {
  blueprint: BlueprintItem
  organizationId: string
  onExit: () => void
}

const steps = ['Configuration', 'Preview changes']
const overrideSections = ['Terraform configuration', 'Bucket', 'Resources', 'Network', 'Authentication']

type BlueprintConfigurationSection = 'service-information' | 'blueprint-setup' | 'overrides'
type BlueprintFieldValue = string | boolean
type BlueprintFieldValues = Record<string, BlueprintFieldValue>

function formatFieldLabel(name: string) {
  const label = name.replace(/_/g, ' ')
  return `${label.charAt(0).toUpperCase()}${label.slice(1)}`
}

function getDefaultFieldValue(field: BlueprintManifestVariableField): BlueprintFieldValue {
  if (field.type.type === 'bool') return field.default_value === 'true'
  return field.default_value ?? ''
}

function getStringFieldValue(value: BlueprintFieldValue | undefined) {
  return typeof value === 'string' ? value : ''
}

function getBooleanFieldValue(value: BlueprintFieldValue | undefined) {
  return typeof value === 'boolean' ? value : false
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
  field,
  onChange,
  value,
}: {
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
      hint={field.description ?? undefined}
      onChange={(event) => onChange(event.currentTarget.value)}
    />
  )
}

function OverridesSection({ active, onClick }: { active: boolean; onClick: () => void }) {
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

      <div>
        {overrideSections.map((section, index) => (
          <button
            key={section}
            type="button"
            className={`flex w-full items-center justify-between px-4 py-4 text-left text-sm font-medium leading-5 text-neutral-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-strong ${
              index < overrideSections.length - 1 ? 'border-b border-neutral' : ''
            }`}
            aria-expanded={false}
          >
            {section}
            <Icon iconName="angle-down" className="text-sm text-neutral-subtle" />
          </button>
        ))}
      </div>
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

  const editableBlueprintFields = useMemo(
    () => blueprintManifestFields.filter((field) => field.kind === 'variable'),
    [blueprintManifestFields]
  )
  const contextBlueprintFields = useMemo(
    () => blueprintManifestFields.filter((field) => field.kind === 'contextVariable'),
    [blueprintManifestFields]
  )

  useEffect(() => {
    if (blueprintManifestFields.length) {
      console.log('Blueprint service manifest', blueprintManifestFields)
    }
  }, [blueprintManifestFields])

  // TODO: refactor this. That does not look good. Should use react-hook-form
  useEffect(() => {
    if (!editableBlueprintFields.length) return

    setBlueprintFieldValues((currentValues) => {
      let hasNewDefaultValue = false
      const nextValues = { ...currentValues }

      editableBlueprintFields.forEach((field) => {
        if (nextValues[field.name] !== undefined) return

        nextValues[field.name] = getDefaultFieldValue(field)
        hasNewDefaultValue = true
      })

      return hasNewDefaultValue ? nextValues : currentValues
    })
  }, [editableBlueprintFields])

  return (
    <FunnelFlow totalSteps={steps.length} currentStep={1} currentTitle={steps[0]} onExit={onExit}>
      <div className="flex w-full overflow-auto bg-background">
        <main className="mx-auto flex min-h-full w-full max-w-[620px] flex-col justify-between px-4 pb-6 pt-6">
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

            <div className="flex flex-col gap-3">
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
                    {editableBlueprintFields.map((field) => (
                      <BlueprintManifestVariableInput
                        key={field.name}
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
                    {contextBlueprintFields.map((field) => (
                      <InputText
                        key={field.name}
                        name={field.name}
                        label={formatFieldLabel(field.name)}
                        value={field.source ?? ''}
                        disabled
                        hint="Automatically sourced by Qovery"
                      />
                    ))}
                    <Button
                      type="button"
                      size="md"
                      color="neutral"
                      className="w-fit"
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
                onClick={() => setCurrentSection('overrides')}
              />
            </div>
          </div>

          <footer className="mt-12 border-t border-neutral pt-4">
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
