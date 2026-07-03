import { useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo } from 'react'
import { type Value } from '@qovery/shared/interfaces'
import { Button, FunnelFlowBody, Icon, InputSelect, InputText } from '@qovery/shared/ui'
import { useBlueprintCreateContext } from '../blueprint-create-context/blueprint-create-context'
import {
  type BlueprintFieldValue,
  formatFieldLabel,
  getBlueprintFieldPath,
  getFieldValidationError,
  getStringFieldValue,
  isFieldValid,
  sortBlueprintMajorVersions,
} from '../blueprint-creation-utils/blueprint-creation-utils'
import { useBlueprintManifestFields } from '../blueprint-manifest-context/blueprint-manifest-context'
import { BlueprintManifestVariableInput } from './blueprint-creation-components/blueprint-manifest-variable-input/blueprint-manifest-variable-input'
import { BlueprintSection } from './blueprint-creation-components/blueprint-section/blueprint-section'
import { OverridesSectionCard } from './blueprint-creation-components/overrides-section-card/overrides-section-card'

type BlueprintConfigurationSection = 'service-information' | 'blueprint-setup' | 'overrides'

interface BlueprintConfigurationViewProps {
  currentSection: BlueprintConfigurationSection
}

export function BlueprintServiceInformationSection() {
  return <BlueprintConfigurationView currentSection="service-information" />
}

export function BlueprintSetupSection() {
  return <BlueprintConfigurationView currentSection="blueprint-setup" />
}

export function BlueprintOverridesConfigurationSection() {
  return <BlueprintConfigurationView currentSection="overrides" />
}

export function BlueprintConfigurationView({ currentSection }: BlueprintConfigurationViewProps) {
  const navigate = useNavigate()
  const { blueprint, creationFlowUrl, onViewDetails, setCurrentStep } = useBlueprintCreateContext()
  const isServiceInformationValid = useIsServiceInformationValid()
  const navigateToSection = (section: BlueprintConfigurationSection) => {
    navigate({ to: `${creationFlowUrl}/${section}` })
  }

  useEffect(() => {
    setCurrentStep(1)
  }, [setCurrentStep])

  return (
    <FunnelFlowBody customContentWidth="max-w-[620px]">
      <header className="mb-5">
        <h1 className="text-2xl font-medium leading-8 text-neutral">{blueprint.name} configuration</h1>
        <p className="mt-1 text-sm leading-5 text-neutral-subtle">
          Provisioned from{' '}
          <button type="button" className="font-normal underline hover:text-neutral" onClick={onViewDetails}>
            {blueprint.name}
          </button>{' '}
          blueprint
        </p>
      </header>

      <div className="flex flex-col gap-3 pb-14">
        <BlueprintSection
          active={currentSection === 'service-information'}
          completed={currentSection !== 'service-information'}
          iconName="circle-info"
          title="Service information"
          onClick={() => navigateToSection('service-information')}
        >
          {currentSection === 'service-information' && (
            <ServiceInformationSectionContent onContinue={() => navigateToSection('blueprint-setup')} />
          )}
        </BlueprintSection>

        <BlueprintSection
          active={currentSection === 'blueprint-setup'}
          completed={currentSection === 'overrides'}
          disabled={!isServiceInformationValid}
          iconName="chart-bullet"
          title="Blueprint setup"
          onClick={() => navigateToSection('blueprint-setup')}
        >
          {currentSection === 'blueprint-setup' && (
            <BlueprintSetupSectionContent onContinue={() => navigateToSection('overrides')} />
          )}
        </BlueprintSection>

        {currentSection === 'service-information' ? (
          <OverridesSectionCard active={false} disabled onClick={() => navigateToSection('overrides')} />
        ) : (
          <BlueprintOverridesSection currentSection={currentSection} onClick={() => navigateToSection('overrides')} />
        )}
      </div>

      {currentSection === 'overrides' ? <ConfirmConfigurationFooter /> : <DisabledConfirmConfigurationFooter />}
    </FunnelFlowBody>
  )
}

interface ServiceInformationSectionContentProps {
  onContinue: () => void
}

function ServiceInformationSectionContent({ onContinue }: ServiceInformationSectionContentProps) {
  const { blueprint, form, serviceVersion } = useBlueprintCreateContext()
  const serviceName = form.watch('serviceName')
  const versionTag = form.watch('versionTag')
  const isServiceInformationValid = useIsServiceInformationValid()
  const blueprintVersionOptions = useMemo<Value[]>(
    () =>
      sortBlueprintMajorVersions(blueprint.majorVersions).map((majorVersion) => ({
        label: majorVersion.serviceVersion,
        value: majorVersion.latestTag,
      })),
    [blueprint.majorVersions]
  )

  return (
    <>
      <InputText
        name="service-name"
        label="Service name"
        value={serviceName}
        onChange={(event) => form.setValue('serviceName', event.currentTarget.value)}
        autoFocus
      />
      {blueprintVersionOptions.length > 1 ? (
        <InputSelect
          label="Blueprint version"
          value={versionTag}
          options={blueprintVersionOptions}
          onChange={(value) =>
            form.setValue('versionTag', Array.isArray(value) ? value[0] : value, { shouldDirty: true })
          }
          isSearchable={blueprintVersionOptions.length > 6}
        />
      ) : (
        <InputText name="blueprint-version" label="Blueprint version" value={serviceVersion} disabled />
      )}
      <Button
        type="button"
        size="md"
        color="neutral"
        className="w-fit"
        disabled={!isServiceInformationValid}
        onClick={onContinue}
      >
        Continue
        <Icon iconName="arrow-right" />
      </Button>
    </>
  )
}

interface BlueprintSetupSectionContentProps {
  onContinue: () => void
}

function BlueprintSetupSectionContent({ onContinue }: BlueprintSetupSectionContentProps) {
  const { form } = useBlueprintCreateContext()
  const { requiredBlueprintFields } = useBlueprintManifestFields()
  const blueprintFieldValues = form.watch('fields')
  const isBlueprintSetupValid = useIsBlueprintSetupValid()
  const updateFieldValue = (name: string, value: BlueprintFieldValue) => {
    form.setValue(getBlueprintFieldPath(name), value, { shouldDirty: true, shouldValidate: true })
  }

  return (
    <>
      {requiredBlueprintFields.map((field, index) => (
        <BlueprintManifestVariableInput
          key={field.name}
          autoFocus={index === 0}
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
        onClick={onContinue}
      >
        Continue
        <Icon iconName="arrow-right" />
      </Button>
    </>
  )
}

interface BlueprintOverridesSectionProps {
  currentSection: Exclude<BlueprintConfigurationSection, 'service-information'>
  onClick: () => void
}

function BlueprintOverridesSection({ currentSection, onClick }: BlueprintOverridesSectionProps) {
  const { optionalBlueprintFields, overridableContextBlueprintFields } = useBlueprintManifestFields()
  const isBlueprintSetupValid = useIsBlueprintSetupValid()
  const hasOverrideFields = optionalBlueprintFields.length > 0 || overridableContextBlueprintFields.length > 0

  return (
    <OverridesSectionCard active={currentSection === 'overrides'} disabled={!isBlueprintSetupValid} onClick={onClick}>
      {currentSection === 'overrides' && hasOverrideFields && <OverridesSectionContent />}
    </OverridesSectionCard>
  )
}

function OverridesSectionContent() {
  const { form } = useBlueprintCreateContext()
  const { optionalBlueprintFields, overridableContextBlueprintFields } = useBlueprintManifestFields()
  const blueprintFieldValues = form.watch('fields')
  const updateFieldValue = (name: string, value: BlueprintFieldValue) => {
    form.setValue(getBlueprintFieldPath(name), value, { shouldDirty: true, shouldValidate: true })
  }

  return (
    <>
      {optionalBlueprintFields.map((field, index) => (
        <BlueprintManifestVariableInput
          key={field.name}
          autoFocus={index === 0}
          error={getFieldValidationError(field, blueprintFieldValues[field.name])}
          field={field}
          value={blueprintFieldValues[field.name]}
          onChange={(value) => updateFieldValue(field.name, value)}
        />
      ))}
      {overridableContextBlueprintFields.map((field, index) => (
        <InputText
          key={field.name}
          name={field.name}
          label={formatFieldLabel(field.name)}
          value={getStringFieldValue(blueprintFieldValues[field.name])}
          hint={field.source ? `Automatically sourced from ${field.source}` : undefined}
          autoFocus={optionalBlueprintFields.length === 0 && index === 0}
          onChange={(event) => updateFieldValue(field.name, event.currentTarget.value)}
        />
      ))}
    </>
  )
}

function ConfirmConfigurationFooter() {
  const navigate = useNavigate()
  const { creationFlowUrl } = useBlueprintCreateContext()
  const isBlueprintSetupValid = useIsBlueprintSetupValid()

  return (
    <footer className="fixed bottom-0 left-1/2 z-10 w-full max-w-[620px] -translate-x-1/2 border-t border-neutral bg-background px-4 py-4">
      <Button
        type="button"
        size="lg"
        className="w-full justify-center"
        disabled={!isBlueprintSetupValid}
        onClick={() => navigate({ to: `${creationFlowUrl}/summary` })}
      >
        Confirm blueprint configuration
        <Icon iconName="arrow-right" />
      </Button>
    </footer>
  )
}

function DisabledConfirmConfigurationFooter() {
  return (
    <footer className="fixed bottom-0 left-1/2 z-10 w-full max-w-[620px] -translate-x-1/2 border-t border-neutral bg-background px-4 py-4">
      <Button type="button" size="lg" className="w-full justify-center" disabled>
        Confirm blueprint configuration
        <Icon iconName="arrow-right" />
      </Button>
    </footer>
  )
}

function useIsBlueprintSetupValid() {
  const { form } = useBlueprintCreateContext()
  const { requiredBlueprintFields } = useBlueprintManifestFields()
  const blueprintFieldValues = form.watch('fields')

  return requiredBlueprintFields.every((field) => isFieldValid(field, blueprintFieldValues[field.name]))
}

function useIsServiceInformationValid() {
  const { form } = useBlueprintCreateContext()
  const serviceName = form.watch('serviceName')

  return Boolean(serviceName.trim())
}
