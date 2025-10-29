import {
  type ApplicationGitRepository,
  type GitProviderEnum,
  type GitTokenResponse,
  type TerraformRequest,
} from 'qovery-typescript-axios'
import { Controller, type UseFormReturn } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { useProjects } from '@qovery/domains/projects/feature'
import { APPLICATION_URL, APPLICATION_VARIABLES_URL } from '@qovery/shared/routes'
import { Callout, Heading, Icon, InputSelect, InputText, Link, RadioGroup, Section } from '@qovery/shared/ui'
import useTerraformAvailableVersions from '../hooks/use-terraform-available-versions/use-terraform-available-versions'

export interface TerraformGeneralData
  extends Omit<TerraformRequest, 'source' | 'ports' | 'values_override' | 'arguments' | 'timeout_sec' | 'provider'> {
  source_provider: 'GIT'
  repository: string
  git_repository?: ApplicationGitRepository
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

export const TerraformConfigurationSettings = ({
  methods,
  isSettings,
}: {
  methods: UseFormReturn<TerraformGeneralData>
  isSettings?: boolean
}) => {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()
  const { data: versions = [], isLoading: isTerraformVersionLoading } = useTerraformAvailableVersions()

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

        {isSettings ? (
          <Controller
            name="provider_version.explicit_version"
            control={methods.control}
            rules={{
              required: true,
              pattern: {
                value: /^\d+\.\d+(.\d+)?$/,
                message: 'Please enter a valid version.',
              },
            }}
            render={({ field, fieldState: { error } }) => (
              <InputText
                name={field.name}
                type="text"
                onChange={field.onChange}
                value={field.value}
                label="Terraform version"
                error={error?.message}
                hint="Select the Terraform version to use for the service"
              />
            )}
          />
        ) : (
          <Controller
            name="provider_version.explicit_version"
            control={methods.control}
            render={({ field }) => (
              <InputSelect
                label="Terraform version"
                value={field.value}
                isLoading={isTerraformVersionLoading}
                onChange={field.onChange}
                options={versions.map((v) => ({ label: v.version, value: v.version }))}
                hint="Select the Terraform version to use for the service"
              />
            )}
          />
        )}

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
          rules={{
            required: true,
            validate: (value) =>
              value !== '' && !isNaN(Number(value)) && Number(value) > 0 ? true : 'Timeout must be a positive number',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputText
              name={field.name}
              type="number"
              onChange={field.onChange}
              value={field.value}
              label="Execution timeout (in seconds)"
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
                <Callout.Text>
                  {isSettings ? (
                    <span>
                      Define environment variables in{' '}
                      <Link
                        to={
                          APPLICATION_URL(organizationId, projectId, environmentId, applicationId) +
                          APPLICATION_VARIABLES_URL
                        }
                      >
                        the variables section
                      </Link>
                      .
                    </span>
                  ) : (
                    'You will be able to define the environment variables at the next step.'
                  )}
                </Callout.Text>
              </Callout.Root>
            )}
          </Callout.Text>
        </Callout.Root>
      </Section>

      {!isSettings && (
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
                disabled={!isSettings}
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
                disabled={!isSettings}
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
                disabled={!isSettings}
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
      )}
    </div>
  )
}
