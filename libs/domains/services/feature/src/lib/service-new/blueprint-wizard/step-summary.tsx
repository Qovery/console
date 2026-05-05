import { useFormContext } from 'react-hook-form'
import { Button, Heading, Icon, Section, SummaryValue } from '@qovery/shared/ui'
import { type BlueprintEntry, ENGINE_LABELS, PROVIDER_CONFIG } from '../blueprints'
import { type BlueprintWizardFormData, getSetupParameters } from './types'

export interface StepSummaryProps {
  blueprint: BlueprintEntry
  onBack: () => void
  onCreate: () => void
  onCreateAndDeploy: () => void
  isLoadingCreate?: boolean
  isLoadingCreateAndDeploy?: boolean
}

export function StepSummary({
  blueprint,
  onBack,
  onCreate,
  onCreateAndDeploy,
  isLoadingCreate,
  isLoadingCreateAndDeploy,
}: StepSummaryProps) {
  const methods = useFormContext<BlueprintWizardFormData>()
  const values = methods.getValues()
  const params = getSetupParameters(blueprint)
  const providerCfg = PROVIDER_CONFIG[blueprint.provider]

  return (
    <Section>
      <div className="mb-10">
        <Heading className="mb-2">Ready to create your service</Heading>
        <p className="text-sm text-neutral-subtle">
          Review your configuration. Nothing is provisioned until you create the service.
        </p>
      </div>

      <div className="mb-10">
        {/* Blueprint section */}
        <Section className="mb-2 flex w-full flex-row rounded border border-neutral bg-surface-neutral p-4">
          <div className="mr-2 flex-grow">
            <Heading className="mb-3">Blueprint</Heading>
            <ul className="list-none space-y-2 text-sm text-neutral-subtle">
              <li>
                <strong className="font-medium text-neutral">Source: </strong>
                <span className="inline-flex items-center gap-2 align-middle">
                  {providerCfg.icon && <img src={providerCfg.icon} alt="" className="h-4 w-4 object-contain" />}
                  {blueprint.name}
                </span>
              </li>
              <SummaryValue label="Engine" value={ENGINE_LABELS[blueprint.engine]} />
              <SummaryValue label="Version" value={`v${values.majorServiceVersion}`} />
            </ul>
          </div>
        </Section>

        {/* Base info section */}
        <Section className="mb-2 flex w-full flex-row rounded border border-neutral bg-surface-neutral-component p-4">
          <div className="mr-2 flex-grow">
            <Heading className="mb-3">Base info</Heading>
            <ul className="list-none space-y-2 text-sm text-neutral-subtle">
              <SummaryValue label="Service name" value={values.serviceName} />
            </ul>
          </div>
          <Button aria-label="Edit base info" type="button" variant="outline" color="neutral" size="md" onClick={onBack} iconOnly>
            <Icon className="text-base" iconName="gear-complex" />
          </Button>
        </Section>

        {/* Setup section */}
        {params.length > 0 && (
          <Section className="mb-2 flex w-full flex-row rounded border border-neutral bg-surface-neutral-component p-4">
            <div className="mr-2 flex-grow">
              <Heading className="mb-3">Setup</Heading>
              <ul className="list-none space-y-2 text-sm text-neutral-subtle">
                {params.map((parameter) => (
                  <SummaryValue key={parameter.id} label={parameter.label} value={values.setupParams[parameter.id] || '-'} />
                ))}
              </ul>
            </div>
            <Button aria-label="Edit setup" type="button" variant="outline" color="neutral" size="md" onClick={onBack} iconOnly>
              <Icon className="text-base" iconName="gear-complex" />
            </Button>
          </Section>
        )}

        {/* Advanced section */}
        <Section className="mb-2 flex w-full flex-row rounded border border-neutral bg-surface-neutral-component p-4">
          <div className="mr-2 flex-grow">
            <Heading className="mb-3">Advanced settings</Heading>
            <ul className="list-none space-y-2 text-sm text-neutral-subtle">
              <SummaryValue
                label="Credentials"
                value={values.credentialsMode === 'cluster' ? 'Cluster IAM' : 'Environment IAM'}
              />
              <SummaryValue label="CPU" value={`${values.cpuMilli} mCPU`} />
              <SummaryValue label="Memory" value={`${values.memoryMib} MiB`} />
              <SummaryValue label="Deployment timeout" value={`${values.timeoutSec} s`} />
            </ul>
          </div>
          <Button aria-label="Edit advanced settings" type="button" variant="outline" color="neutral" size="md" onClick={onBack} iconOnly>
            <Icon className="text-base" iconName="gear-complex" />
          </Button>
        </Section>
      </div>

      <div className="mt-10 flex justify-between">
        <Button onClick={onBack} type="button" size="lg" variant="plain">
          Back
        </Button>
        <div className="flex gap-2">
          <Button
            loading={isLoadingCreate}
            onClick={onCreate}
            size="lg"
            type="button"
            variant="surface"
            color="neutral"
          >
            Create
          </Button>
          <Button
            loading={isLoadingCreateAndDeploy}
            onClick={onCreateAndDeploy}
            type="button"
            size="lg"
            color="brand"
            variant="solid"
          >
            Create and deploy
          </Button>
        </div>
      </div>
    </Section>
  )
}

export default StepSummary
