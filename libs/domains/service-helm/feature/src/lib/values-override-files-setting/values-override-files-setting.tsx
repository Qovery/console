import { type GitProviderEnum, type HelmRequestAllOfSource } from 'qovery-typescript-axios'
import { type PropsWithChildren, type ReactNode } from 'react'
import { Controller, type UseFormReturn } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { PREVIEW_CODE } from '@qovery/shared/routes'
import {
  Button,
  Callout,
  ExternalLink,
  Heading,
  Icon,
  IconAwesomeEnum,
  InputSelect,
  Popover,
  Section,
} from '@qovery/shared/ui'
import useHelmDefaultValues from '../hooks/use-helm-default-values/use-helm-default-values'
import ValuesOverrideYamlSetting from '../values-override-yaml-setting/values-override-yaml-setting'

export type ValuesOverrideTypes = 'GIT_REPOSITORY' | 'YAML' | 'NONE'

export interface HelmValuesFileData {
  type: ValuesOverrideTypes
  repository?: string | null
  provider?: GitProviderEnum
  branch?: string
  paths?: string
  content?: string
}

export interface ValuesOverrideFilesSettingProps {
  source: HelmRequestAllOfSource
  methods: UseFormReturn<HelmValuesFileData>
  watchFieldType: ValuesOverrideTypes
  gitRepositorySettings: ReactNode
  onSubmit: () => void
}

export function ValuesOverrideFilesSetting({
  methods,
  source,
  watchFieldType,
  children,
  gitRepositorySettings,
  onSubmit,
}: PropsWithChildren<ValuesOverrideFilesSettingProps>) {
  const { environmentId = '' } = useParams()

  const { refetch: refetchHelmDefaultValues, isFetching: isLoadingHelmDefaultValues } = useHelmDefaultValues({
    environmentId,
    helmDefaultValuesRequest: {
      source,
    },
    enabled: false,
  })

  const createHelmDefaultValuesMutation = async () => {
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
              Your helm chart might have already a variables.yaml file with some basic configuration. In this section
              you can define your own overrides to customize the helm chart behaviour.
            </li>
            <li>
              You can define the overrides by selecting a YAML file from a git repository (preferred) or by passing a
              raw YAML file.
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
              To get all the Qovery functionalities, add the macro “qovery.labels.service” and
              "qovery.annotations.service" within the field managing the labels/annotations assigned to the deployed
              pods. Qovery will automatically replace the macro with a dedicated set of labels/annotations.
            </li>
          </ul>
          <ExternalLink href="https://hub.qovery.com/docs/using-qovery/configuration/helm/#values">
            Documentation
          </ExternalLink>
          <Popover.Close className="absolute top-4 right-4">
            <button type="button">
              <Icon name={IconAwesomeEnum.XMARK} className="text-lg leading-4 text-neutral-400" />
            </button>
          </Popover.Close>
        </Popover.Content>
      </Popover.Root>
      <Callout.Root className="mb-5" color="yellow">
        <Callout.Icon>
          <Icon name={IconAwesomeEnum.TRIANGLE_EXCLAMATION} />
        </Callout.Icon>
        <Callout.Text>
          <Callout.TextHeading>Add the Qovery macros to your override</Callout.TextHeading>
          <Callout.TextDescription className="text-xs">
            To get all the Qovery functionalities (Logs, Statuses, Helm stop and restart), add the macro
            “qovery.labels.service” and "qovery.annotations.service" within the field managing the labels/annotations
            assigned to the deployed Pods/Deployments/Services/Jobs.
            <ExternalLink
              href="https://hub.qovery.com/docs/using-qovery/configuration/helm/#values"
              className="ml-0.5"
              size="xs"
            >
              See more details
            </ExternalLink>
          </Callout.TextDescription>
        </Callout.Text>
      </Callout.Root>
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
            <div className="flex flex-col gap-3">{gitRepositorySettings}</div>
          </Section>
        )}
        {children}
      </form>
    </Section>
  )
}

export default ValuesOverrideFilesSetting
