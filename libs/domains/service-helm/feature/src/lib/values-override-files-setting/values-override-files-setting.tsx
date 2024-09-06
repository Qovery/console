import { type GitProviderEnum, type GitTokenResponse, type HelmRequestAllOfSource } from 'qovery-typescript-axios'
import { type PropsWithChildren, type ReactNode } from 'react'
import { Controller, type UseFormReturn } from 'react-hook-form'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { ExternalLink, Heading, Icon, InputSelect, Popover, Section } from '@qovery/shared/ui'
import ValuesOverrideYamlSetting from '../values-override-yaml-setting/values-override-yaml-setting'

export type ValuesOverrideTypes = 'GIT_REPOSITORY' | 'YAML' | 'NONE'

export interface HelmValuesFileData {
  type: ValuesOverrideTypes
  repository?: string | null
  provider?: keyof typeof GitProviderEnum
  git_token_id?: GitTokenResponse['id']
  git_token_name?: GitTokenResponse['name']
  is_public_repository?: boolean
  branch?: string
  paths?: string
  content?: string
  auto_deploy?: boolean
}

export interface ValuesOverrideFilesSettingProps {
  source: HelmRequestAllOfSource
  methods: UseFormReturn<HelmValuesFileData>
  watchFieldType: ValuesOverrideTypes
  gitRepositorySettings: ReactNode
  onSubmit: () => void
  isSetting?: boolean
}

export function ValuesOverrideFilesSetting({
  methods,
  source,
  watchFieldType,
  children,
  gitRepositorySettings,
  onSubmit,
  isSetting,
}: PropsWithChildren<ValuesOverrideFilesSettingProps>) {
  return (
    <Section>
      {isSetting ? (
        <SettingsHeading
          title="Values override as file"
          description="Define the YAML file(s) to be applied as override to the default values.yaml delivered with the chart. It is highly recommended to store the override file(s) in a git repository."
        />
      ) : (
        <Heading className="mb-2">Values override as file</Heading>
      )}

      <form className="space-y-10" onSubmit={onSubmit}>
        {!isSetting && (
          <div>
            <p className="text-sm text-neutral-350">
              Define the YAML file(s) to be applied as override to the default values.yaml delivered with the chart. It
              is highly recommended to store the override file(s) in a git repository.
            </p>
            <Popover.Root>
              <Popover.Trigger>
                <span className="cursor-pointer text-sm font-medium text-brand-500 transition hover:text-brand-600">
                  How it works <Icon className="text-xs" iconStyle="regular" iconName="circle-question" />
                </span>
              </Popover.Trigger>
              <Popover.Content side="left" className="relative text-sm text-neutral-350" style={{ width: 440 }}>
                <h6 className="mb-2 font-medium text-neutral-400">How it works</h6>
                <ul className="list-disc pl-4">
                  <li>
                    Your helm chart might have already a variables.yaml file with some basic configuration. In this
                    section you can define your own overrides to customize the helm chart behaviour.
                  </li>
                  <li>
                    You can define the overrides by selecting a YAML file from a git repository (preferred) or by
                    passing a raw YAML file.
                  </li>
                  <li>
                    If you don’t have a file, you can skip this step and instead define the values override directly as
                    arguments (--set).
                  </li>
                  <li>
                    You can use the Qovery environment variables as overrides by using the placeholder
                    “qovery.env.ENV_VAR_NAME” (Example: qovery.env.DB_URL. Qovery will manage the replacement of those
                    placeholders at deployment time.
                  </li>
                  <li>
                    To let you access every Qovery functionality, additional Qovery labels and annotations are
                    automatically injected in some of the Kubernetes objects deployed within your helm.
                  </li>
                </ul>
                <ExternalLink href="https://hub.qovery.com/docs/using-qovery/configuration/helm/#values">
                  Documentation
                </ExternalLink>
                <Popover.Close className="absolute right-4 top-4">
                  <button type="button">
                    <Icon iconName="xmark" className="text-lg leading-4 text-neutral-400" />
                  </button>
                </Popover.Close>
              </Popover.Content>
            </Popover.Root>
          </div>
        )}
        <div className="flex flex-col gap-4">
          <Controller
            name="type"
            control={methods.control}
            defaultValue="GIT_REPOSITORY"
            render={({ field }) => (
              <InputSelect
                label="File source"
                value={field.value}
                onChange={field.onChange}
                options={[
                  {
                    label: 'Git repository',
                    value: 'GIT_REPOSITORY',
                  },
                  {
                    label: 'Raw YAML',
                    value: 'YAML',
                  },
                  {
                    label: 'None',
                    value: 'NONE',
                  },
                ]}
              />
            )}
          />
        </div>
        {watchFieldType === 'YAML' && (
          <Section>
            <Heading className="mb-2">Override with raw Yaml</Heading>
            <p className="mb-6 text-sm text-neutral-350">
              You can define here the YAML containing the overrides you want to apply. The YAML will be stored by Qovery
              and can be updated later within the settings but no history will be retained.
            </p>
            <div className="flex flex-col gap-3">
              <ValuesOverrideYamlSetting
                content={methods.getValues('content')}
                onSubmit={(value) => {
                  methods.setValue('content', value)
                  isSetting && onSubmit()
                }}
                source={source}
              />
            </div>
          </Section>
        )}

        {watchFieldType === 'GIT_REPOSITORY' && (
          <Section>
            <Heading className="mb-2">Override from repository</Heading>
            <p className="mb-6 text-sm text-neutral-350">
              Specify the repository and the path containing the override yaml file to be passed via the “-f” helm
              argument. More than one file can be used as override by adding them in the path field separated by a
              semi-colon. If you don’t have a repository, you can set the override manually or via a raw YAML file.
            </p>
            <div className="flex flex-col gap-3">{gitRepositorySettings}</div>
          </Section>
        )}
        {children}
      </form>
    </Section>
  )
}

export default ValuesOverrideFilesSetting
