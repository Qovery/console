import {
  type ApplicationGitRepository,
  type GitProviderEnum,
  type GitTokenResponse,
  TerraformEngineEnum,
  type TerraformRequest,
} from 'qovery-typescript-axios'
import { Controller, type UseFormReturn } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { type DockerfileFragment } from '@qovery/domains/services/data-access'
import { IconEnum } from '@qovery/shared/enums'
import { APPLICATION_URL, APPLICATION_VARIABLES_URL } from '@qovery/shared/routes'
import {
  Callout,
  CopyButton,
  Heading,
  Icon,
  InputSelect,
  InputText,
  Link,
  Modal,
  RadioGroup,
  Section,
} from '@qovery/shared/ui'
import useTerraformAvailableVersions from '../../hooks/use-terraform-available-versions/use-terraform-available-versions'
import { DockerfileFragmentInlineSetting } from '../dockerfile-fragment-inline-setting/dockerfile-fragment-inline-setting'

export const terraformEngines = [
  { name: 'Terraform', value: TerraformEngineEnum.TERRAFORM, icon: <Icon name={IconEnum.TERRAFORM} /> },
  { name: 'OpenTofu', value: TerraformEngineEnum.OPEN_TOFU, icon: <Icon name={IconEnum.OPEN_TOFU} /> },
]

export type DockerfileFragmentSource = 'none' | 'file' | 'inline'

export interface TerraformGeneralData
  extends Omit<
    TerraformRequest,
    'source' | 'ports' | 'values_override' | 'arguments' | 'timeout_sec' | 'dockerfile_fragment'
  > {
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
  provider_version: {
    read_from_terraform_block: boolean
    explicit_version: string
  }
  dockerfile_fragment_source: DockerfileFragmentSource
  dockerfile_fragment_path?: string
  dockerfile_fragment_content?: string
  dockerfile_fragment?: DockerfileFragment | null
}

export function buildDockerfileFragment(data: TerraformGeneralData): DockerfileFragment | null {
  switch (data.dockerfile_fragment_source) {
    case 'file':
      return data.dockerfile_fragment_path ? { type: 'file', path: data.dockerfile_fragment_path } : null
    case 'inline':
      return data.dockerfile_fragment_content ? { type: 'inline', content: data.dockerfile_fragment_content } : null
    case 'none':
    default:
      return null
  }
}

export function extractDockerfileFragmentFields(fragment: DockerfileFragment | null | undefined): {
  dockerfile_fragment_source: DockerfileFragmentSource
  dockerfile_fragment_path?: string
  dockerfile_fragment_content?: string
} {
  if (!fragment) {
    return { dockerfile_fragment_source: 'none' }
  }
  if (fragment.type === 'file' && 'path' in fragment) {
    return {
      dockerfile_fragment_source: 'file',
      dockerfile_fragment_path: fragment.path,
    }
  }
  if (fragment.type === 'inline' && 'content' in fragment) {
    return {
      dockerfile_fragment_source: 'inline',
      dockerfile_fragment_content: fragment.content,
    }
  }
  return { dockerfile_fragment_source: 'none' }
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
  const cliCommand = `qovery terraform setup-backend --terraform ${isSettings ? applicationId : '<SERVICE_ID>'}`
  const backend = methods.watch('backend')
  const dockerfileFragmentSource = methods.watch('dockerfile_fragment_source') ?? 'none'

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
          name="engine"
          control={methods.control}
          render={({ field }) => (
            <InputSelect
              label="Terraform Engine"
              className="capitalize"
              value={field.value}
              onChange={field.onChange}
              options={terraformEngines.map((v) => ({ label: v.name, value: v.value, icon: v.icon }))}
              hint="Select the Terraform engine to use for the service"
            />
          )}
        />

        {methods.formState.dirtyFields.engine && isSettings && (
          <Callout.Root color="yellow">
            <Callout.Icon>
              <Icon iconName="info-circle" iconStyle="regular" />
            </Callout.Icon>
            <Callout.Text>
              Changing the terraform engine will require to reconfigure your existing backend/state.
            </Callout.Text>
          </Callout.Root>
        )}

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
            render={({ field }) => {
              const versionOptions = versions
                .filter((v) => v.engine === methods.watch('engine'))
                .map((v) => ({ label: v.version, value: v.version }))

              return (
                <InputSelect
                  label="Terraform version"
                  value={field.value}
                  isLoading={isTerraformVersionLoading}
                  onChange={field.onChange}
                  options={versionOptions}
                  hint="Select the Terraform version to use for the service"
                />
              )
            }}
          />
        )}
      </Section>

      <Section className="gap-4">
        <Heading level={2}>Backend configuration</Heading>
        <Callout.Root color="neutral" className="p-4">
          <Callout.Text className="w-full">
            <Controller
              name="backend"
              control={methods.control}
              defaultValue={'kubernetes' in methods.getValues('backend') ? { kubernetes: {} } : { user_provided: {} }}
              render={({ field }) => (
                <RadioGroup.Root
                  className="flex flex-col gap-5"
                  defaultValue={'kubernetes' in field.value ? 'kubernetes' : 'user_provided'}
                  onValueChange={(value) =>
                    field.onChange(value === 'kubernetes' ? { kubernetes: {} } : { user_provided: {} })
                  }
                >
                  <label className="grid grid-cols-[16px_1fr] gap-3">
                    <RadioGroup.Item value="kubernetes" />
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">Use backend generated by Qovery (Kubernetes)</span>
                      <ul className="list-disc pl-3 text-neutral-350">
                        <li>
                          Not recommended for production environments (as there won't be any backup of the state).
                        </li>
                        <li>Qovery manages the Terraform state in your cluster.</li>
                        <li>We override backend.tf at runtime; you don't need to configure a backend.</li>
                      </ul>
                    </div>
                  </label>
                  <label className="grid grid-cols-[16px_1fr] gap-3">
                    <RadioGroup.Item value="user_provided" />
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">Use your own backend</span>
                      <ul className="list-disc pl-3 text-neutral-350">
                        <li>Qovery does not override your files.</li>
                        <li>You must configure your backend and set the required environment variables.</li>
                        <li>Credentials are provided via environment variables.</li>
                      </ul>
                    </div>
                  </label>
                </RadioGroup.Root>
              )}
            />

            {'kubernetes' in backend && (
              <div className="mt-4 flex w-full flex-col gap-2 rounded border border-neutral-250 px-4 py-3 text-sm">
                <span className="font-medium">Access Terraform state from your local machine</span>
                <p className="text-neutral-350">
                  {isSettings ? (
                    <span>
                      You can configure and access the state of your Terraform service from your local machine with the
                      following CLI command.
                    </span>
                  ) : (
                    <span>
                      Once your service is created, you can configure and access the state of your Terraform service
                      from your local machine with the following CLI command.
                    </span>
                  )}
                </p>
                <div className="flex justify-between gap-6 rounded-sm bg-neutral-150 p-3 text-neutral-400">
                  <div>
                    <span className="select-none">$ </span>
                    {cliCommand}
                  </div>
                  <CopyButton content={cliCommand} />
                </div>
              </div>
            )}
          </Callout.Text>
        </Callout.Root>
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

      <Section className="gap-4">
        <Heading level={2}>Execution settings</Heading>
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
        <div className="space-y-1">
          <Heading level={2}>Custom build commands</Heading>
          <p className="text-sm text-neutral-350">
            Add custom tools to the Terraform execution environment (e.g., AWS CLI, kubectl, jq).
          </p>
          <Modal
            trigger={
              <button
                type="button"
                className="mt-1 cursor-pointer text-sm font-medium text-brand-500 transition hover:text-brand-600"
              >
                Show how it works <Icon className="text-xs" iconStyle="regular" iconName="circle-question" />
              </button>
            }
            width={600}
          >
            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-neutral-400">How custom build commands work</h3>
              <p className="mb-4 text-sm text-neutral-350">
                Your custom commands are injected into the Dockerfile used to build the Terraform execution image. This
                allows you to install additional tools needed during Terraform execution.
              </p>
              <p className="mb-2 text-xs text-neutral-350">Simplified example (actual Dockerfile may differ):</p>
              <pre className="mb-4 overflow-x-auto rounded bg-neutral-100 p-4 text-xs text-neutral-400">
                {`FROM debian:trixie-slim
WORKDIR /app
COPY . .

# ── Your custom commands are injected here ──

USER app
ENTRYPOINT ["terraform"]`}
              </pre>
              <div className="space-y-2 text-sm text-neutral-350">
                <p>
                  <strong className="text-neutral-400">Custom commands example:</strong>
                </p>
                <pre className="overflow-x-auto rounded bg-neutral-100 p-3 text-xs text-neutral-400">
                  {`RUN apt-get update && apt-get install -y \\
    awscli \\
    kubectl \\
    jq \\
    curl \\
  && rm -rf /var/lib/apt/lists/*`}
                </pre>
              </div>
            </div>
          </Modal>
        </div>

        <Callout.Root color="neutral" className="p-4">
          <Callout.Text className="w-full">
            <Controller
              name="dockerfile_fragment_source"
              control={methods.control}
              defaultValue={methods.getValues('dockerfile_fragment_source') ?? 'none'}
              render={({ field }) => (
                <RadioGroup.Root
                  className="flex flex-col gap-5"
                  value={field.value}
                  onValueChange={(value: DockerfileFragmentSource) => {
                    field.onChange(value)
                  }}
                >
                  <label className="grid grid-cols-[16px_1fr] gap-3">
                    <RadioGroup.Item value="none" />
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">No custom commands</span>
                      <span className="text-sm text-neutral-350">
                        Use the default Terraform image without modifications.
                      </span>
                    </div>
                  </label>
                  <div>
                    <label className="grid grid-cols-[16px_1fr] gap-3">
                      <RadioGroup.Item value="file" />
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">Load commands from a file in my repository</span>
                        <span className="text-sm text-neutral-350">
                          Point to a file containing RUN commands (e.g., /terraform/install-tools.dockerfile).
                        </span>
                      </div>
                    </label>
                    {dockerfileFragmentSource === 'file' && (
                      <div className="ml-7 mt-3">
                        <Controller
                          name="dockerfile_fragment_path"
                          control={methods.control}
                          rules={{
                            required: dockerfileFragmentSource === 'file' ? 'Path is required' : false,
                            pattern: {
                              value: /^\/[^/]+(\/[^/]+)*$/,
                              message:
                                'Must be an absolute path starting with / (e.g., /terraform/install-tools.dockerfile)',
                            },
                          }}
                          render={({ field: pathField, fieldState: { error } }) => (
                            <InputText
                              name={pathField.name}
                              type="text"
                              onChange={pathField.onChange}
                              value={pathField.value ?? ''}
                              label="File path"
                              error={error?.message}
                              hint="Absolute path from repository root (e.g., /scripts/install-tools.dockerfile)"
                            />
                          )}
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="grid grid-cols-[16px_1fr] gap-3">
                      <RadioGroup.Item value="inline" />
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">Enter commands directly</span>
                        <span className="text-sm text-neutral-350">Type RUN commands to install tools.</span>
                      </div>
                    </label>
                    {dockerfileFragmentSource === 'inline' && (
                      <div className="ml-7 mt-3">
                        <DockerfileFragmentInlineSetting
                          content={methods.watch('dockerfile_fragment_content') ?? ''}
                          onSubmit={(value) => {
                            methods.setValue('dockerfile_fragment_content', value ?? '', { shouldDirty: true })
                          }}
                        />
                      </div>
                    )}
                  </div>
                </RadioGroup.Root>
              )}
            />
          </Callout.Text>
        </Callout.Root>
      </Section>
    </div>
  )
}
