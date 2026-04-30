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

function EditSectionButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <Button aria-label={label} type="button" variant="outline" color="neutral" size="md" onClick={onClick} iconOnly>
      <Icon className="text-base" iconName="gear-complex" />
    </Button>
  )
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
    <Section className="space-y-10">
      <div className="flex flex-col gap-2">
        <Heading className="mb-2">Ready to create your service</Heading>
        <p className="text-sm text-neutral-subtle">
          Review your configuration. Nothing is provisioned until you create the service.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Blueprint section */}
        <Section className="rounded-md border border-neutral bg-surface-neutral-subtle p-4">
          <div className="flex justify-between">
            <Heading>Blueprint</Heading>
          </div>
          <ul className="list-none space-y-2 text-sm text-neutral-subtle">
            <li>
              <strong className="font-medium text-neutral">Source:</strong>{' '}
              <span className="inline-flex items-center gap-2 align-middle">
                {providerCfg.icon && <img src={providerCfg.icon} alt="" className="h-4 w-4 object-contain" />}
                {blueprint.name}
              </span>
            </li>
            <SummaryValue label="Engine" value={ENGINE_LABELS[blueprint.engine]} />
            <SummaryValue label="Version" value={`v${values.majorServiceVersion}`} />
          </ul>
        </Section>

        {/* Base info section */}
        <Section className="rounded-md border border-neutral bg-surface-neutral-subtle p-4">
          <div className="flex justify-between">
            <Heading>Base info</Heading>
            <EditSectionButton onClick={onBack} label="Edit base info" />
          </div>
          <ul className="list-none space-y-2 text-sm text-neutral-subtle">
            <SummaryValue label="Service name" value={values.serviceName} />
          </ul>
        </Section>

        {/* Setup section */}
        {params.length > 0 && (
          <Section className="rounded-md border border-neutral bg-surface-neutral-subtle p-4">
            <div className="flex justify-between">
              <Heading>Setup</Heading>
              <EditSectionButton onClick={onBack} label="Edit setup" />
            </div>
            <ul className="list-none space-y-2 text-sm text-neutral-subtle">
              {params.map((p) => (
                <SummaryValue key={p.id} label={p.label} value={values.setupParams[p.id] || '-'} />
              ))}
            </ul>
          </Section>
        )}

        {/* Advanced section */}
        <Section className="rounded-md border border-neutral bg-surface-neutral-subtle p-4">
          <div className="flex justify-between">
            <Heading>Advanced settings</Heading>
            <EditSectionButton onClick={onBack} label="Edit advanced settings" />
          </div>
          <ul className="list-none space-y-2 text-sm text-neutral-subtle">
            <SummaryValue
              label="Credentials"
              value={values.credentialsMode === 'cluster' ? 'Cluster IAM' : 'Environment IAM'}
            />
            <SummaryValue label="CPU" value={`${values.cpuMilli} mCPU`} />
            <SummaryValue label="Memory" value={`${values.memoryMib} MiB`} />
            <SummaryValue label="Deployment timeout" value={`${values.timeoutSec} s`} />
          </ul>
        </Section>
      </div>

      <div className="flex justify-between">
        <Button onClick={onBack} type="button" size="lg" variant="plain">
          Back
        </Button>
        <div className="flex gap-2">
          <Button
            loading={isLoadingCreate}
            onClick={onCreate}
            size="lg"
            type="button"
            variant="outline"
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
