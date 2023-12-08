import { Controller, FormProvider } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import {
  GitBranchSettings,
  GitProviderSetting,
  GitRepositorySetting,
  getGitTokenValue,
} from '@qovery/domains/organizations/feature'
import { ValuesOverrideFilesSetting } from '@qovery/domains/service-helm/feature'
import { SERVICES_HELM_CREATION_SUMMARY_URL, SERVICES_HELM_CREATION_URL, SERVICES_URL } from '@qovery/shared/routes'
import { Button, FunnelFlowBody, FunnelFlowHelpCard, InputText } from '@qovery/shared/ui'
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

  const gitRepositoryElement = (
    <>
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
    </>
  )

  return (
    <FunnelFlowBody helpSection={funnelCardHelp}>
      <FormProvider {...valuesOverrideFileForm}>
        <ValuesOverrideFilesSetting
          methods={valuesOverrideFileForm}
          watchFieldType={watchFieldType}
          source={source}
          gitRepositoryElement={gitRepositoryElement}
          onSubmit={onSubmit}
        >
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
        </ValuesOverrideFilesSetting>
      </FormProvider>
    </FunnelFlowBody>
  )
}

export default StepValuesOverrideFilesFeature
