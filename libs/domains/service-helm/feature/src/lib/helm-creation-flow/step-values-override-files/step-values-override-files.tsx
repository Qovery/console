import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Controller, FormProvider, type UseFormReturn } from 'react-hook-form'
import { match } from 'ts-pattern'
import {
  GitBranchSettings,
  GitProviderSetting,
  GitPublicRepositorySettings,
  GitRepositorySetting,
} from '@qovery/domains/organizations/feature'
import { AutoDeploySetting, buildHelmSourceFromGeneralData } from '@qovery/domains/services/feature'
import { Button, Callout, FunnelFlowBody, Icon, InputText } from '@qovery/shared/ui'
import {
  type HelmValuesFileData,
  ValuesOverrideFilesSetting,
} from '../../values-override-files-setting/values-override-files-setting'
import { ValuesOverrideYamlSettingBase } from '../../values-override-yaml-setting/values-override-yaml-setting'
import { useHelmCreateContext } from '../helm-creation-flow'

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
      <p className="ml-4 mt-1 text-xs text-neutral-subtle">
        Specify multiple paths by separating them with a semi-colon
      </p>
    </div>
  )
}

export function HelmStepValuesOverrideFile() {
  const navigate = useNavigate()
  const search = useSearch({ strict: false })
  const { organizationId = '' } = useParams({ strict: false })
  const { generalForm, valuesOverrideFileForm, setCurrentStep, creationFlowUrl } = useHelmCreateContext()

  const generalData = generalForm.getValues()
  const source = buildHelmSourceFromGeneralData(generalData)

  useEffect(() => {
    setCurrentStep(2)
  }, [setCurrentStep])

  const handleSubmit = valuesOverrideFileForm.handleSubmit((data) => {
    valuesOverrideFileForm.reset({
      ...data,
      auto_deploy: data.is_public_repository ? false : data.auto_deploy,
    })
  })

  const watchFieldType = valuesOverrideFileForm.watch('type')
  const watchFieldGitProvider = valuesOverrideFileForm.watch('provider')
  const watchFieldGitTokenId = valuesOverrideFileForm.watch('git_token_id')
  const watchFieldGitRepository = valuesOverrideFileForm.watch('git_repository')
  const watchFieldGitBranch = valuesOverrideFileForm.watch('branch')
  const watchFieldIsPublicRepository = valuesOverrideFileForm.watch('is_public_repository')

  const gitRepositorySettings = (
    <>
      <GitProviderSetting organizationId={organizationId} />
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
            <GitRepositorySetting
              organizationId={organizationId}
              gitProvider={watchFieldGitProvider}
              gitTokenId={watchFieldGitTokenId}
            />
          )}
          {watchFieldGitProvider && watchFieldGitRepository && (
            <>
              <GitBranchSettings
                organizationId={organizationId}
                gitProvider={watchFieldGitProvider}
                gitTokenId={watchFieldGitTokenId}
                hideRootPath
              />
              {watchFieldGitBranch && <GitPathsSettings methods={valuesOverrideFileForm} />}
            </>
          )}
          {generalData.source_provider === 'HELM_REPOSITORY' && watchFieldGitProvider && watchFieldGitRepository && (
            <AutoDeploySetting source="GIT" className="mt-3" />
          )}
          {generalData.source_provider === 'GIT' &&
            (generalData.auto_deploy ? (
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
            ))}
        </>
      )}
    </>
  )

  const isContinueDisabled = match(watchFieldType)
    .with('GIT_REPOSITORY', () => true)
    .with('YAML', () => true)
    .with('NONE', () => true)
    .exhaustive()

  const yamlSetting = (
    <ValuesOverrideYamlSettingBase
      content={valuesOverrideFileForm.getValues('content')}
      onSubmit={(value) => {
        valuesOverrideFileForm.setValue('content', value)
      }}
      source={source}
    />
  )

  return (
    <FunnelFlowBody>
      <FormProvider {...valuesOverrideFileForm}>
        <ValuesOverrideFilesSetting
          methods={valuesOverrideFileForm}
          watchFieldType={watchFieldType}
          source={source}
          gitRepositorySettings={gitRepositorySettings}
          onSubmit={handleSubmit}
          yamlSetting={yamlSetting}
        >
          <Callout.Root color="sky">
            <Callout.Icon>
              <Icon iconName="circle-info" iconStyle="regular" />
            </Callout.Icon>
            <Callout.Text>
              <Callout.TextHeading>Next steps are not migrated yet</Callout.TextHeading>
              You can already configure the Helm chart source and the values override file in console-v5. The remaining
              creation steps will be added in a later iteration.
            </Callout.Text>
          </Callout.Root>

          <div className="flex justify-between">
            <Button
              type="button"
              size="lg"
              variant="plain"
              color="neutral"
              onClick={() => navigate({ to: `${creationFlowUrl}/general`, search })}
            >
              Back
            </Button>
            <Button type="submit" size="lg" disabled={isContinueDisabled}>
              Continue
            </Button>
          </div>
        </ValuesOverrideFilesSetting>
      </FormProvider>
    </FunnelFlowBody>
  )
}
