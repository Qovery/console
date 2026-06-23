import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Button, Icon, InputText } from '@qovery/shared/ui'
import {
  type BlueprintConfigurationSection,
  useBlueprintCreateContext,
} from '../blueprint-create-context/blueprint-create-context'
import {
  type BlueprintFieldValue,
  formatFieldLabel,
  getBlueprintFieldPath,
  getFieldValidationError,
  getStringFieldValue,
  isFieldValid,
} from '../blueprint-creation-utils/blueprint-creation-utils'
import { BlueprintManifestVariableInput } from './blueprint-creation-components/blueprint-manifest-variable-input/blueprint-manifest-variable-input'
import { BlueprintSection } from './blueprint-creation-components/blueprint-section/blueprint-section'
import { OverridesSection } from './blueprint-creation-components/overrides-section/overrides-section'

export function BlueprintConfigurationView() {
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
