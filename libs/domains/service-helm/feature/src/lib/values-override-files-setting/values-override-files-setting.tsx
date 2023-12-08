import { type GitProviderEnum, type HelmRequestAllOfSource } from 'qovery-typescript-axios'
import { type PropsWithChildren, type ReactNode, useState } from 'react'
import { Controller, type UseFormReturn } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { PREVIEW_CODE } from '@qovery/shared/routes'
import { Button, Heading, Icon, IconAwesomeEnum, InputSelect, Popover, Section } from '@qovery/shared/ui'
import useHelmDefaultValues from '../hooks/use-helm-default-values/use-helm-default-values'
import ValuesOverrideYamlSetting from '../values-override-yaml-setting/values-override-yaml-setting'

export type ValuesOverrideTypes = 'GIT_REPOSITORY' | 'YAML' | 'NONE'

export interface HelmValuesFileData {
  type: ValuesOverrideTypes
  repository?: string
  provider?: GitProviderEnum
  branch?: string
  paths?: string
  content?: string
}

export interface ValuesOverrideFilesSettingProps {
  source: HelmRequestAllOfSource
  methods: UseFormReturn<HelmValuesFileData>
  watchFieldType: ValuesOverrideTypes
  gitRepositoryElement: ReactNode
  onSubmit: () => void
}

export function ValuesOverrideFilesSetting({
  methods,
  source,
  watchFieldType,
  children,
  gitRepositoryElement,
  onSubmit,
}: PropsWithChildren<ValuesOverrideFilesSettingProps>) {
  const { environmentId = '' } = useParams()

  const [enabledHelmDefaultValues, setEnabledHelmDefaultValues] = useState(false)

  const { refetch: refetchHelmDefaultValues, isFetching: isLoadingHelmDefaultValues } = useHelmDefaultValues({
    environmentId,
    helmDefaultValuesRequest: {
      source,
    },
    enabled: enabledHelmDefaultValues,
  })

  const createHelmDefaultValuesMutation = async () => {
    setEnabledHelmDefaultValues(true)
    const { data: helmDefaultValues } = await refetchHelmDefaultValues()
    if (helmDefaultValues) window.open(`${PREVIEW_CODE}?code=${encodeURIComponent(helmDefaultValues)}`, '_blank')
  }

  return (
    <Section className="items-start">
      <Heading className="mb-2">Values override as file</Heading>
      <p className="text-sm text-neutral-350 mb-2">
        Define the YAML file(s) to be applied as override to the default values.yaml delivered with the chart. It is
        highly recommended to store the override file(s) in a git repository.
      </p>
      <Popover.Root>
        <Popover.Trigger>
          <span className="text-sm cursor-pointer text-brand-500 hover:text-brand-600 transition font-medium mb-5">
            How it works <Icon className="text-xs" name={IconAwesomeEnum.CIRCLE_QUESTION} />
          </span>
        </Popover.Trigger>
        <Popover.Content side="left" className="text-neutral-350 text-sm relative" style={{ width: 440 }}>
          <h6 className="text-neutral-400 font-medium mb-2">How it works</h6>
          <ul className="list-disc pl-4">
            <li>
              You can specify one or more YAML file to be used to override the values.yaml delivered with the chart.
              These will be passed via the -f helm argument.
            </li>
            <li>
              The files can be retrieved either from a git repository (preferred option) or they can be stored as raw
              YAML by Qovery (no history is retained). The chosen git repository can be a repository different from the
              one of the chart.
            </li>
            <li>
              If you don’t have a file, you can skip this step and instead define the values override directly as
              arguments (--set).
            </li>
            <li>
              You can use the Qovery environment variables as overrides by using the pattern “qovery.env.ENV_VAR_NAME”.
            </li>
            <li>
              To get all the Qovery functionalities, add the macro “qovery.labels.service” within the field managing the
              labels assigned to the deployed pods.
            </li>
          </ul>
          <Popover.Close className="absolute top-4 right-4">
            <button type="button">
              <Icon name={IconAwesomeEnum.XMARK} className="text-lg leading-4 text-neutral-400" />
            </button>
          </Popover.Close>
        </Popover.Content>
      </Popover.Root>
      <Button
        size="lg"
        variant="surface"
        color="neutral"
        className="mb-10"
        loading={isLoadingHelmDefaultValues}
        onClick={() => createHelmDefaultValuesMutation()}
      >
        See default values.yaml <Icon className="text-xs ml-2" name={IconAwesomeEnum.ARROW_UP_RIGHT_FROM_SQUARE} />
      </Button>
      <form onSubmit={onSubmit} className="w-full">
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
        {watchFieldType === 'YAML' && (
          <Section>
            <Heading className="mt-10 mb-2">Override with raw Yaml</Heading>
            <p className="text-sm text-neutral-350 mb-6">
              You can define here the YAML containing the overrides you want to apply. The YAML will be stored by Qovery
              and can be updated later within the settings but no history will be retained.
            </p>
            <div className="flex flex-col gap-3">
              <ValuesOverrideYamlSetting
                content={methods.getValues('content')}
                onSubmit={(value) => methods.setValue('content', value)}
                source={source}
              />
            </div>
          </Section>
        )}

        {watchFieldType === 'GIT_REPOSITORY' && (
          <Section>
            <Heading className="mt-10 mb-2">Override from repository</Heading>
            <p className="text-sm text-neutral-350 mb-6">
              Specify the repository and the path containing the override yaml file to be passed via the “-f” helm
              argument. More than one file can be used as override by adding them in the path field separated by a
              semi-colon. If you don’t have a repository, you can set the override manually or via a raw YAML file.
            </p>
            <div className="flex flex-col gap-3">{gitRepositoryElement}</div>
          </Section>
        )}
        {children}
      </form>
    </Section>
  )
}

export default ValuesOverrideFilesSetting
