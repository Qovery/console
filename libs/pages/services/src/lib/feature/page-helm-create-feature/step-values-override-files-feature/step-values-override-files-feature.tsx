import { useState } from 'react'
import { Controller, FormProvider } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import {
  GitBranchSettings,
  GitProviderSetting,
  GitRepositorySetting,
  getGitTokenValue,
} from '@qovery/domains/organizations/feature'
import { ValuesOverrideYamlSetting, useHelmDefaultValues } from '@qovery/domains/service-helm/feature'
import {
  PREVIEW_CODE,
  SERVICES_HELM_CREATION_SUMMARY_URL,
  SERVICES_HELM_CREATION_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import {
  Button,
  FunnelFlowBody,
  FunnelFlowHelpCard,
  Heading,
  Icon,
  IconAwesomeEnum,
  InputSelect,
  InputText,
  Popover,
  Section,
} from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { buildGitRepoUrl } from '@qovery/shared/util-js'
import { useHelmCreateContext } from '../page-helm-create-feature'

export function StepValuesOverrideFilesFeature() {
  useDocumentTitle('General - Values override as file')

  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const { generalForm, valuesOverrideFileForm, setCurrentStep } = useHelmCreateContext()

  const generalData = generalForm.getValues()

  const source = match(generalData.source_provider)
    .with('GIT', () => {
      const gitToken = getGitTokenValue(generalData.provider ?? '')

      return {
        git_repository: {
          url: buildGitRepoUrl(gitToken?.type ?? generalData.provider ?? '', generalData.repository),
          branch: generalData.branch,
          root_path: generalData.root_path,
        },
      }
    })
    .with('HELM_REPOSITORY', () => ({
      helm_repository: {
        repository: generalData.repository,
        chart_name: generalData.chart_name,
        chart_version: generalData.chart_version,
      },
    }))
    .exhaustive()

  const [enabledHelmDefaultValues, setEnabledHelmDefaultValues] = useState(false)

  const { refetch: refetchHelmDefaultValues, isFetching: isLoadingHelmDefaultValues } = useHelmDefaultValues({
    environmentId,
    helmDefaultValuesRequest: {
      source,
    },
    enabled: enabledHelmDefaultValues,
  })
  const navigate = useNavigate()
  setCurrentStep(2)

  const funnelCardHelp = (
    <FunnelFlowHelpCard
      title="Using values overrides"
      items={[
        'Your helm chart might have already a variables.yaml file with some basic configuration. In this section you can define your own overrides to customize the helm chart behaviour.',
        'You can define the overrides by selecting a YAML file from a git repository, by passing a raw YAML file or by adding one by one your overrides. You can combine all the 3 methods.',
        'You can use the Qovery environment variables as overrides by using the placeholder “qovery.env.<env_var_name>” (Example: qovery.env.DB_URL. Qovery will manage the replacement of those placeholders at deployment time.',
        'To get all the Qovery functionalities, add the macro “qovery.labels.service” within the field managing the labels assigned to the deployed pods.',
        'Overrides can be passed in the “Helm arguments” field as well but we recommend to use this section.',
      ]}
      helpSectionProps={{
        description: 'Need help? You may find these links useful',
        links: [
          {
            link: 'https://hub.qovery.com/docs/using-qovery/configuration/application/#general',
            linkLabel: 'How to configure my Helm chart',
          },
        ],
      }}
    />
  )

  const pathCreate = `${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_HELM_CREATION_URL}`

  const onSubmit = valuesOverrideFileForm.handleSubmit(() => {
    navigate(pathCreate + SERVICES_HELM_CREATION_SUMMARY_URL)
  })

  const createHelmDefaultValuesMutation = async () => {
    setEnabledHelmDefaultValues(true)
    const { data: helmDefaultValues } = await refetchHelmDefaultValues()
    if (helmDefaultValues) window.open(`${PREVIEW_CODE}?code=${encodeURIComponent(helmDefaultValues)}`, '_blank')
  }

  const watchFieldType = valuesOverrideFileForm.watch('type')
  const watchFieldGitProvider = valuesOverrideFileForm.watch('provider')
  const watchFieldGitRepository = valuesOverrideFileForm.watch('repository')

  const disabledContinueButton = match(watchFieldType)
    .with('GIT_REPOSITORY', () => {
      const { provider, repository, branch, paths } = valuesOverrideFileForm.watch()
      return !provider || !repository || !branch || !paths
    })
    .with('YAML', () => {
      const { content } = valuesOverrideFileForm.watch()
      return !content
    })
    .with('NONE', () => false)
    .exhaustive()

  return (
    <FunnelFlowBody helpSection={funnelCardHelp}>
      <FormProvider {...valuesOverrideFileForm}>
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
                  The files can be retrieved either from a git repository (preferred option) or they can be stored as
                  raw YAML by Qovery (no history is retained). The chosen git repository can be a repository different
                  from the one of the chart.
                </li>
                <li>
                  If you don’t have a file, you can skip this step and instead define the values override directly as
                  arguments (--set).
                </li>
                <li>
                  You can use the Qovery environment variables as overrides by using the pattern
                  “qovery.env.ENV_VAR_NAME”.
                </li>
                <li>
                  To get all the Qovery functionalities, add the macro “qovery.labels.service” within the field managing
                  the labels assigned to the deployed pods.
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
              control={valuesOverrideFileForm.control}
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
            {watchFieldType === 'GIT_REPOSITORY' && (
              <Section>
                <Heading className="mt-10 mb-2">Override from repository</Heading>
                <p className="text-sm text-neutral-350 mb-6">
                  Specify the repository and the path containing the override yaml file to be passed via the “-f” helm
                  argument. More than one file can be used as override by adding them in the path field separated by a
                  semi-colon. If you don’t have a repository, you can set the override manually or via a raw YAML file.
                </p>
                <div className="flex flex-col gap-3">
                  <GitProviderSetting />
                  {watchFieldGitProvider && <GitRepositorySetting gitProvider={watchFieldGitProvider} />}
                  {watchFieldGitProvider && watchFieldGitRepository && (
                    <>
                      <GitBranchSettings gitProvider={watchFieldGitProvider} hideRootPath />
                      <div>
                        <Controller
                          name="paths"
                          control={valuesOverrideFileForm.control}
                          rules={{
                            required: 'Value required',
                          }}
                          render={({ field, fieldState: { error } }) => (
                            <InputText
                              label="Overrides path"
                              name={field.name}
                              onChange={field.onChange}
                              value={field.value}
                              error={error?.message}
                            />
                          )}
                        />
                        <p className="text-xs text-neutral-350 ml-4 mt-1">
                          Specify multiple paths by separating them with a semi-colon
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </Section>
            )}
            {watchFieldType === 'YAML' && (
              <Section>
                <Heading className="mt-10 mb-2">Override with raw Yaml</Heading>
                <p className="text-sm text-neutral-350 mb-6">
                  You can define here the YAML containing the overrides you want to apply. The YAML will be stored by
                  Qovery and can be updated later within the settings but no history will be retained.
                </p>
                <div className="flex flex-col gap-3">
                  <ValuesOverrideYamlSetting
                    content={valuesOverrideFileForm.getValues('content')}
                    onSubmit={(value) => valuesOverrideFileForm.setValue('content', value)}
                    source={source}
                  />
                </div>
              </Section>
            )}
            <div className="flex justify-between mt-10">
              <Button type="button" size="lg" variant="surface" color="neutral" onClick={() => navigate(-1)}>
                Back
              </Button>
              <div className="flex gap-3">
                <Button type="submit" size="lg" disabled={disabledContinueButton}>
                  Continue
                </Button>
              </div>
            </div>
          </form>
        </Section>
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepValuesOverrideFilesFeature
