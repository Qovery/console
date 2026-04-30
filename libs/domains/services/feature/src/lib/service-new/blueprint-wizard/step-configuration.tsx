import { Controller, useFormContext } from 'react-hook-form'
import {
  Accordion,
  AccordionRoot,
  Button,
  Heading,
  Icon,
  InputSelect,
  InputText,
  Section,
} from '@qovery/shared/ui'
import { type BlueprintEntry } from '../blueprints'
import { type BlueprintWizardFormData, getSetupParameters } from './types'

export interface StepConfigurationProps {
  blueprint: BlueprintEntry
  onNext: () => void
}

// Single configuration page combining: Base info, Setup, Advanced settings.
// Each is its own expandable card. Default-open: Base info (the only one
// that always needs input). Setup and Advanced collapsed if they have sensible defaults.
export function StepConfiguration({ blueprint, onNext }: StepConfigurationProps) {
  const methods = useFormContext<BlueprintWizardFormData>()
  const setupParams = getSetupParameters(blueprint)

  const onSubmit = methods.handleSubmit(() => onNext())

  const versionOptions = blueprint.versions.map((v, i) => ({
    label: i === 0 ? `${v.version} (latest)` : v.version,
    value: v.version,
  }))

  return (
    <Section className="space-y-10">
      <div className="flex flex-col gap-2">
        <Heading className="mb-2">Configure {blueprint.name}</Heading>
        <p className="text-sm text-neutral-subtle">
          Fill in the parameters for your service. Each section can be expanded — sensible defaults are pre-filled.
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-8">
        <AccordionRoot type="multiple" defaultValue={['base-info']} className="flex flex-col gap-3">
          {/* Base info */}
          <Accordion.Item
            value="base-info"
            className="overflow-hidden rounded-md border border-neutral bg-surface-neutral-subtle"
          >
            <Accordion.Trigger className="bg-surface-neutral-subtle">
              <span className="flex flex-1 items-center justify-between">
                <span className="font-medium text-neutral">Base info</span>
                <span className="mr-2 text-xs text-neutral-subtle">Service name and version</span>
              </span>
            </Accordion.Trigger>
            <Accordion.Content className="bg-surface-neutral-subtle">
              <div className="flex flex-col gap-4 p-5 pt-2">
                <Controller
                  name="serviceName"
                  control={methods.control}
                  rules={{
                    required: 'Enter a service name.',
                    pattern: {
                      value: /^[a-z0-9-]+$/,
                      message: 'Lowercase letters, numbers, and hyphens only.',
                    },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <InputText
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      label="Service name"
                      hint="Lowercase letters, numbers, and hyphens only."
                      error={error?.message}
                    />
                  )}
                />

                <Controller
                  name="majorServiceVersion"
                  control={methods.control}
                  rules={{ required: 'Pick a version.' }}
                  render={({ field, fieldState: { error } }) => (
                    <InputSelect
                      label="Service version"
                      value={field.value}
                      onChange={field.onChange}
                      options={versionOptions}
                      hint="Fixed once you provision. To change later, create a new service."
                      error={error?.message}
                    />
                  )}
                />
              </div>
            </Accordion.Content>
          </Accordion.Item>

          {/* Setup */}
          <Accordion.Item
            value="setup"
            className="overflow-hidden rounded-md border border-neutral bg-surface-neutral-subtle"
          >
            <Accordion.Trigger className="bg-surface-neutral-subtle">
              <span className="flex flex-1 items-center justify-between">
                <span className="font-medium text-neutral">Setup</span>
                <span className="mr-2 text-xs text-neutral-subtle">Blueprint parameters</span>
              </span>
            </Accordion.Trigger>
            <Accordion.Content className="bg-surface-neutral-subtle">
              <div className="flex flex-col gap-4 p-5 pt-2">
                {setupParams.length === 0 ? (
                  <p className="text-sm text-neutral-subtle">This blueprint has no parameters to configure.</p>
                ) : (
                  setupParams.map((p) => (
                    <Controller
                      key={p.id}
                      name={`setupParams.${p.id}`}
                      control={methods.control}
                      rules={p.required ? { required: `${p.label} is required.` } : undefined}
                      render={({ field, fieldState: { error } }) =>
                        p.type === 'select' && p.options ? (
                          <InputSelect
                            label={p.label}
                            value={field.value}
                            onChange={field.onChange}
                            options={p.options}
                            hint={p.helper}
                            error={error?.message}
                          />
                        ) : (
                          <InputText
                            name={field.name}
                            value={field.value}
                            onChange={field.onChange}
                            label={p.label}
                            type={p.type === 'number' ? 'number' : 'text'}
                            hint={p.helper}
                            error={error?.message}
                          />
                        )
                      }
                    />
                  ))
                )}
              </div>
            </Accordion.Content>
          </Accordion.Item>

          {/* Advanced */}
          <Accordion.Item
            value="advanced"
            className="overflow-hidden rounded-md border border-neutral bg-surface-neutral-subtle"
          >
            <Accordion.Trigger className="bg-surface-neutral-subtle">
              <span className="flex flex-1 items-center justify-between">
                <span className="font-medium text-neutral">Advanced settings</span>
                <span className="mr-2 text-xs text-neutral-subtle">Credentials, resources, timeout</span>
              </span>
            </Accordion.Trigger>
            <Accordion.Content className="bg-surface-neutral-subtle">
              <div className="flex flex-col gap-4 p-5 pt-2">
                <Controller
                  name="credentialsMode"
                  control={methods.control}
                  render={({ field }) => (
                    <InputSelect
                      label="Credentials mode"
                      value={field.value}
                      onChange={field.onChange}
                      options={[
                        { value: 'cluster', label: 'Use cluster IAM' },
                        { value: 'environment', label: 'Use environment IAM' },
                      ]}
                      hint="Cluster IAM is the simplest option. Switch to environment-scoped IAM for stricter isolation."
                    />
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="cpuMilli"
                    control={methods.control}
                    rules={{ required: true, min: 100 }}
                    render={({ field, fieldState: { error } }) => (
                      <InputText
                        name={field.name}
                        value={String(field.value)}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        label="CPU (mCPU)"
                        type="number"
                        hint="500 mCPU = 0.5 vCPU."
                        error={error?.message}
                      />
                    )}
                  />
                  <Controller
                    name="memoryMib"
                    control={methods.control}
                    rules={{ required: true, min: 64 }}
                    render={({ field, fieldState: { error } }) => (
                      <InputText
                        name={field.name}
                        value={String(field.value)}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        label="Memory (MiB)"
                        type="number"
                        error={error?.message}
                      />
                    )}
                  />
                </div>

                <Controller
                  name="timeoutSec"
                  control={methods.control}
                  rules={{ required: true, min: 60 }}
                  render={({ field, fieldState: { error } }) => (
                    <InputText
                      name={field.name}
                      value={String(field.value)}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      label="Deployment timeout (s)"
                      type="number"
                      hint="How long to wait for a deploy before marking it failed."
                      error={error?.message}
                    />
                  )}
                />
              </div>
            </Accordion.Content>
          </Accordion.Item>
        </AccordionRoot>

        <div className="flex justify-end">
          <Button type="submit" size="lg" color="brand" variant="solid" radius="rounded">
            Continue
            <Icon iconName="arrow-right" iconStyle="regular" className="ml-2 text-base" />
          </Button>
        </div>
      </form>
    </Section>
  )
}

export default StepConfiguration
