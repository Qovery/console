import { useEffect } from 'react'
import { Controller, FormProvider, type UseFormReturn } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { match } from 'ts-pattern'
import {
  GitBranchSettings,
  GitProviderSetting,
  GitPublicRepositorySettings,
  GitRepositorySetting,
} from '@qovery/domains/organizations/feature'
import { type HelmValuesFileData, ValuesOverrideFilesSetting } from '@qovery/domains/service-helm/feature'
import { AutoDeploySetting } from '@qovery/domains/services/feature'
import { SERVICES_HELM_CREATION_GENERAL_URL, SERVICES_HELM_CREATION_VALUES_STEP_2_URL } from '@qovery/shared/routes'
import { Button, Callout, FunnelFlowBody, Icon, InputText } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { buildGitRepoUrl } from '@qovery/shared/util-js'
import { useHelmCreateContext } from '../page-helm-create-feature'

function GitPathsSettings({ methods }: { methods: UseFormReturn<HelmValuesFileData> }) {
  return (
    <div>
      <Controller
        name="paths"
        control={methods.control}
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
      <p className="ml-4 mt-1 text-xs text-neutral-350">Specify multiple paths by separating them with a semi-colon</p>
    </div>
  )
}

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
    if (watchFieldIsPublicRepository) generalForm.setValue('auto_deploy', false)
    navigate(creationFlowUrl + SERVICES_HELM_CREATION_VALUES_STEP_2_URL)
  })

  const watchFieldType = valuesOverrideFileForm.watch('type')
  const watchFieldGitProvider = valuesOverrideFileForm.watch('provider')
  const watchFieldGitTokenId = valuesOverrideFileForm.watch('git_token_id')
  const watchFieldGitRepository = valuesOverrideFileForm.watch('repository')
  const watchFieldGitBranch = valuesOverrideFileForm.watch('branch')
  const watchFieldIsPublicRepository = valuesOverrideFileForm.watch('is_public_repository')

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
      {watchFieldIsPublicRepository ? (
        <>
          <GitPublicRepositorySettings hideRootPath />
          <GitPathsSettings methods={valuesOverrideFileForm} />
          <Callout.Root color="sky" className="items-center">
            <Callout.Icon>
              <Icon iconName="info-circle" iconStyle="regular" />
            </Callout.Icon>
            <Callout.Text>
              Git automations are disabled when using public repos (auto-deploy, automatic preview environments)
            </Callout.Text>
          </Callout.Root>
        </>
      ) : (
        <>
          {watchFieldGitProvider && (
            <GitRepositorySetting gitProvider={watchFieldGitProvider} gitTokenId={watchFieldGitTokenId} />
          )}
          {watchFieldGitProvider && watchFieldGitRepository && (
            <>
              <GitBranchSettings gitProvider={watchFieldGitProvider} gitTokenId={watchFieldGitTokenId} hideRootPath />
              {watchFieldGitBranch && <GitPathsSettings methods={valuesOverrideFileForm} />}
            </>
          )}
          {generalData.source_provider === 'HELM_REPOSITORY' && watchFieldGitProvider && watchFieldGitRepository && (
            <AutoDeploySetting source="GIT" className="mt-3" />
          )}
          {generalData.source_provider === 'GIT' && (
            <>
              {generalData.auto_deploy ? (
                <Callout.Root color="sky" className="mt-3">
                  <Callout.Icon>
                    <Icon iconName="circle-info" iconStyle="regular" />
                  </Callout.Icon>

                  <Callout.Text>
                    <Callout.TextHeading>Auto-deploy is activated</Callout.TextHeading>
                    The service will be automatically updated on every new commit on the branch.
                  </Callout.Text>
                </Callout.Root>
              ) : (
                <Callout.Root color="sky" className="mt-3">
                  <Callout.Icon>
                    <Icon iconName="circle-info" iconStyle="regular" />
                  </Callout.Icon>
                  <Callout.Text>
                    <Callout.TextHeading>Auto-deploy is not activated</Callout.TextHeading>
                  </Callout.Text>
                </Callout.Root>
              )}
            </>
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
