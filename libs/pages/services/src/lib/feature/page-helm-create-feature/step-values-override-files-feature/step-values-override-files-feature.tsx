import { useEffect } from 'react'
import { Controller, FormProvider } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { match } from 'ts-pattern'
import { GitBranchSettings, GitProviderSetting, GitRepositorySetting } from '@qovery/domains/organizations/feature'
import { ValuesOverrideFilesSetting } from '@qovery/domains/service-helm/feature'
import { AutoDeploySetting } from '@qovery/domains/services/feature'
import { SERVICES_HELM_CREATION_GENERAL_URL, SERVICES_HELM_CREATION_VALUES_STEP_2_URL } from '@qovery/shared/routes'
import { Button, Callout, FunnelFlowBody, Icon, InputText } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { buildGitRepoUrl } from '@qovery/shared/util-js'
import { useHelmCreateContext } from '../page-helm-create-feature'

export function StepValuesOverrideFilesFeature() {
  useDocumentTitle('General - Values override as file')

  const { generalForm, valuesOverrideFileForm, setCurrentStep, creationFlowUrl } = useHelmCreateContext()

  const generalData = generalForm.getValues()

  const source = match(generalData.source_provider)
    .with('GIT', () => {
      return {
        git_repository: {
          url: buildGitRepoUrl(generalData.provider ?? '', generalData.repository),
          branch: generalData.branch,
          root_path: generalData.root_path,
          git_token_id: generalData.git_token_id,
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

  useEffect(() => {
    setCurrentStep(2)
  }, [setCurrentStep])

  const onSubmit = valuesOverrideFileForm.handleSubmit(() => {
    navigate(creationFlowUrl + SERVICES_HELM_CREATION_VALUES_STEP_2_URL)
  })

  const watchFieldType = valuesOverrideFileForm.watch('type')
  const watchFieldGitProvider = valuesOverrideFileForm.watch('provider')
  const watchFieldGitTokenId = valuesOverrideFileForm.watch('git_token_id')
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

  const gitRepositorySettings = (
    <>
      <GitProviderSetting />
      {watchFieldGitProvider && (
        <GitRepositorySetting gitProvider={watchFieldGitProvider} gitTokenId={watchFieldGitTokenId} />
      )}
      {watchFieldGitProvider && watchFieldGitRepository && (
        <>
          <GitBranchSettings gitProvider={watchFieldGitProvider} gitTokenId={watchFieldGitTokenId} hideRootPath />
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
          {generalData.source_provider === 'HELM_REPOSITORY' ? (
            <AutoDeploySetting source="GIT" className="mt-3" />
          ) : generalData.auto_deploy ? (
            <Callout.Root color="sky" className="mt-3">
              <Callout.Icon>
                <Icon iconName="circle-info" />
              </Callout.Icon>

              <Callout.Text className="text-xs">
                <Callout.TextHeading>Auto-deploy is activated</Callout.TextHeading>
                The service will be automatically updated on every new commit on the branch.
              </Callout.Text>
            </Callout.Root>
          ) : (
            <Callout.Root color="sky" className="mt-3">
              <Callout.Icon>
                <Icon iconName="circle-info" />
              </Callout.Icon>
              <Callout.Text className="text-xs">
                <Callout.TextHeading>Auto-deploy is not activated</Callout.TextHeading>
              </Callout.Text>
            </Callout.Root>
          )}
        </>
      )}
    </>
  )

  return (
    <FunnelFlowBody>
      <FormProvider {...valuesOverrideFileForm}>
        <ValuesOverrideFilesSetting
          methods={valuesOverrideFileForm}
          watchFieldType={watchFieldType}
          source={source}
          gitRepositorySettings={gitRepositorySettings}
          onSubmit={onSubmit}
        >
          <div className="flex justify-between">
            <Button
              type="button"
              size="lg"
              variant="plain"
              color="neutral"
              onClick={() => navigate(creationFlowUrl + SERVICES_HELM_CREATION_GENERAL_URL)}
            >
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
