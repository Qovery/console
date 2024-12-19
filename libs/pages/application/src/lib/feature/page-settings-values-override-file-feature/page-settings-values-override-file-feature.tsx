import { type HelmRequestAllOfValuesOverrideFile } from 'qovery-typescript-axios'
import { Controller, FormProvider, type UseFormReturn, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import {
  GitBranchSettings,
  GitProviderSetting,
  GitPublicRepositorySettings,
  GitRepositorySetting,
} from '@qovery/domains/organizations/feature'
import { type HelmValuesFileData, ValuesOverrideFilesSetting } from '@qovery/domains/service-helm/feature'
import { AutoDeploySetting, useDeploymentStatus, useEditService, useService } from '@qovery/domains/services/feature'
import { isHelmRepositorySource } from '@qovery/shared/enums'
import { DEPLOYMENT_LOGS_VERSION_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
import { Button, Callout, Icon, InputText } from '@qovery/shared/ui'
import { guessGitProvider } from '@qovery/shared/util-git'
import { buildGitRepoUrl } from '@qovery/shared/util-js'
import { buildEditServicePayload } from '@qovery/shared/util-services'

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

export function PageSettingsValuesOverrideFileFeature() {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()
  const { data: service } = useService({ serviceId: applicationId, serviceType: 'HELM' })
  const { data: deploymentStatus } = useDeploymentStatus({ environmentId, serviceId: applicationId })
  const { mutate: editService, isLoading: isLoadingEditService } = useEditService({
    environmentId,
    logsLink:
      ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) +
      DEPLOYMENT_LOGS_VERSION_URL(service?.id, deploymentStatus?.execution_id),
  })

  const valuesOverrideFile = service?.values_override.file
  const currentType = valuesOverrideFile?.raw?.values?.[0]?.content
    ? 'YAML'
    : valuesOverrideFile?.git
      ? 'GIT_REPOSITORY'
      : 'NONE'

  const methods = useForm<HelmValuesFileData>({
    mode: 'onChange',
    defaultValues: {
      type: currentType,
      content: valuesOverrideFile?.raw?.values?.[0]?.content ?? '',
      provider: guessGitProvider(valuesOverrideFile?.git?.git_repository?.url ?? ''),
      git_token_id:
        valuesOverrideFile?.git?.git_repository?.git_token_id === null
          ? undefined
          : valuesOverrideFile?.git?.git_repository?.git_token_id,
      repository:
        valuesOverrideFile?.git?.git_repository?.name ?? valuesOverrideFile?.git?.git_repository?.git_token_id,
      branch: valuesOverrideFile?.git?.git_repository?.branch,
      paths: valuesOverrideFile?.git?.paths?.toString(),
    },
  })

  const watchFieldType = methods.watch('type')
  const watchFieldGitProvider = methods.watch('provider')
  const watchFieldGitTokenId = methods.watch('git_token_id')
  const watchFieldGitRepository = methods.watch('repository')
  const watchFieldIsPublicRepository = methods.watch('is_public_repository')
  const watchFieldGitBranch = methods.watch('branch')

  const disabledSaveButton = match(watchFieldType)
    .with('GIT_REPOSITORY', () => {
      const { provider, repository, branch, paths } = methods.watch()
      return !provider || !repository || !branch || !paths
    })
    .with('YAML', () => {
      const { content } = methods.watch()
      return !content
    })
    .with('NONE', () => false)
    .exhaustive()

  const onSubmit = methods.handleSubmit(async (data) => {
    if (!service) return

    const valuesOverrideFile: HelmRequestAllOfValuesOverrideFile | undefined = match(watchFieldType)
      .with('GIT_REPOSITORY', () => {
        return {
          git: {
            git_repository: {
              url: buildGitRepoUrl(data['provider']!, data['repository']!),
              branch: data['branch'] ?? '',
              git_token_id: data['git_token_id'],
            },
            paths: data['paths']?.split(',') ?? [],
          },
        }
      })
      .with('YAML', () => ({
        raw: {
          values: [
            {
              name: 'override',
              content: data['content']!,
            },
          ],
        },
      }))
      .with('NONE', () => undefined)
      .exhaustive()

    service.auto_deploy ||= data.auto_deploy ?? false

    if (data.is_public_repository) {
      service.auto_deploy = false
    }

    editService({
      serviceId: applicationId,
      payload: buildEditServicePayload({
        service,
        request: {
          values_override: {
            ...service?.values_override,
            file: valuesOverrideFile,
          },
        },
      }),
    })
  })

  const gitRepositorySettings = (
    <>
      <GitProviderSetting />
      {watchFieldIsPublicRepository ? (
        <>
          <GitPublicRepositorySettings hideRootPath />
          <GitPathsSettings methods={methods} />
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
              {watchFieldGitBranch && <GitPathsSettings methods={methods} />}
            </>
          )}
          {watchFieldGitProvider && (
            <>
              {isHelmRepositorySource(service?.source) ? (
                <AutoDeploySetting source="GIT" className="mt-3" />
              ) : service?.auto_deploy ? (
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
    <div className="flex w-full max-w-content-with-navigation-left flex-col justify-between p-8">
      <FormProvider {...methods}>
        <ValuesOverrideFilesSetting
          methods={methods}
          watchFieldType={watchFieldType}
          source={buildEditServicePayload({ service: service! }).source}
          gitRepositorySettings={gitRepositorySettings}
          onSubmit={onSubmit}
          isSetting
        >
          {methods.watch('type') !== 'YAML' && (
            <div className="mt-10 flex justify-end">
              <Button type="submit" size="lg" loading={isLoadingEditService} disabled={disabledSaveButton}>
                Save
              </Button>
            </div>
          )}
        </ValuesOverrideFilesSetting>
      </FormProvider>
    </div>
  )
}

export default PageSettingsValuesOverrideFileFeature
