import { type GitProviderEnum, type GitTokenResponse, type TerraformRequest } from 'qovery-typescript-axios'
import { Controller, type UseFormReturn } from 'react-hook-form'
import { Callout, Heading, Icon, InputSelect, InputText, RadioGroup, Section } from '@qovery/shared/ui'

export interface TerraformGeneralData
  extends Omit<TerraformRequest, 'source' | 'ports' | 'values_override' | 'arguments' | 'timeout_sec' | 'provider'> {
  source_provider: 'GIT'
  repository: string
  is_public_repository?: boolean
  provider?: keyof typeof GitProviderEnum
  git_token_id?: GitTokenResponse['id']
  branch?: string
  root_path?: string
  chart_name?: string
  chart_version?: string
  arguments: string
  timeout_sec: string
  state: 'kubernetes'
  provider_version: {
    read_from_terraform_block: boolean
    explicit_version: string
  }
}

export const TERRAFORM_VERSIONS = [
  '1.12.1',
  '1.11.4',
  '1.10.5',
  '1.9.8',
  '1.8.5',
  '1.7.5',
  '1.6.6',
  '1.5.7',
  '1.4.7',
  '1.3.10',
  '1.2.9',
  '1.1.9',
  '1.0.11',
  '0.15.5',
  '0.14.11',
  '0.13.7',
  '0.12.31',
  '0.11.15',
  '0.10.8',
  '0.9.11',
  '0.8.8',
  '0.7.13',
  '0.6.16',
  '0.5.3',
  '0.4.2',
  '0.3.7',
  '0.2.2',
  '0.1.1',
]

export const TerraformConfigurationSettings = ({ methods }: { methods: UseFormReturn<TerraformGeneralData> }) => {
  return (
    <div className="space-y-10">
      <Section className="space-y-2">
        <Heading level={1}>Terraform configuration</Heading>
        <p className="text-sm text-neutral-350">Customize the resources assigned to the service.</p>
      </Section>

      <Section className="gap-4">
        <div className="space-y-1">
          <Heading level={2}>Core configuration</Heading>
          <p className="text-sm text-neutral-350">Basic Terraform setup and state management settings.</p>
        </div>

        <Controller
          name="provider_version.explicit_version"
          control={methods.control}
          defaultValue={methods.getValues('provider_version.explicit_version')}
          render={({ field }) => (
            <InputSelect
              label="Terraform version"
              value={field.value}
              onChange={field.onChange}
              options={TERRAFORM_VERSIONS.map((v) => ({ label: v, value: v }))}
              hint="Select the Terraform version to use for the service"
            />
          )}
        />

        <Controller
          name="state"
          control={methods.control}
          defaultValue={methods.getValues('state')}
          render={({ field }) => (
            <InputSelect
              label="State management"
              value={field.value}
              onChange={field.onChange}
              options={[
                {
                  label: 'Kubernetes (default)',
                  value: 'kubernetes',
                },
              ]}
              hint="Configure where the state should be located"
              disabled={true}
            />
          )}
        />
      </Section>

      <Section className="gap-4">
        <div className="space-y-1">
          <Heading level={2}>Execution settings</Heading>
          <p className="text-sm text-neutral-350">Configure how Terraform operations are executed.</p>
        </div>

        <Controller
          name="timeout_sec"
          control={methods.control}
          defaultValue={methods.getValues('timeout_sec')}
          render={({ field, fieldState: { error } }) => (
            <InputText
              name={field.name}
              type="number"
              onChange={field.onChange}
              value={field.value}
              label="Execution timeout (in minutes)"
              error={error?.message}
              hint="Maximum duration for Terraform operations"
            />
          )}
        />
      </Section>

      <Section className="gap-4">
        <Heading level={2}>Execution credentials</Heading>

        <Callout.Root color="neutral" className="p-4">
          <Callout.Text>
            <Controller
              name="use_cluster_credentials"
              control={methods.control}
              defaultValue={methods.getValues('use_cluster_credentials')}
              render={({ field }) => (
                <RadioGroup.Root
                  defaultValue={field.value ? 'true' : 'false'}
                  className="flex flex-col gap-5"
                  onValueChange={(value) => field.onChange(value === 'true')}
                >
                  <label className="grid grid-cols-[16px_1fr] gap-3">
                    <RadioGroup.Item value="true" />
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">Cluster credentials</span>
                      <span className="text-sm text-neutral-350">
                        Use the cluster credentials to execute this Terraform manifest.
                      </span>
                    </div>
                  </label>
                  <label className="grid grid-cols-[16px_1fr] gap-3">
                    <RadioGroup.Item value="false" />
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">Environment variables</span>
                      <span className="text-sm text-neutral-350">
                        Use custom credentials injected as environment variables. To be used if cluster credential
                        permissions are not enough.
                      </span>
                    </div>
                  </label>
                </RadioGroup.Root>
              )}
            />

            {methods.watch('use_cluster_credentials') === false && (
              <Callout.Root color="sky" className="mt-4">
                <Callout.Icon>
                  <Icon iconName="info-circle" iconStyle="regular" />
                </Callout.Icon>
                <Callout.Text>You will be able to define the environment variables at the next step.</Callout.Text>
              </Callout.Root>
            )}
          </Callout.Text>
        </Callout.Root>
      </Section>

      <Section className="gap-4">
        <Heading level={2}>Job resources</Heading>
        <Controller
          name="job_resources.cpu_milli"
          control={methods.control}
          defaultValue={methods.getValues('job_resources.cpu_milli')}
          render={({ field, fieldState: { error } }) => (
            <InputText
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              label="vCPU (milli)"
              error={error?.message}
              disabled={true}
            />
          )}
        />
        <Controller
          name="job_resources.ram_mib"
          control={methods.control}
          defaultValue={methods.getValues('job_resources.ram_mib')}
          render={({ field, fieldState: { error } }) => (
            <InputText
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              label="Memory (mb)"
              error={error?.message}
              disabled={true}
            />
          )}
        />
        <Controller
          name="job_resources.storage_gib"
          control={methods.control}
          defaultValue={methods.getValues('job_resources.storage_gib')}
          render={({ field, fieldState: { error } }) => (
            <InputText
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              label="Storage (gb)"
              error={error?.message}
              disabled={true}
            />
          )}
        />
        <Callout.Root color="sky">
          <Callout.Icon>
            <Icon iconName="info-circle" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text>
            Resources at job creation are set by default. If adjustments are needed, update them manually in the job
            settings after creation.
          </Callout.Text>
        </Callout.Root>
      </Section>
    </div>
  )
}
