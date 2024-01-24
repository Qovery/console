import { type HelmRequestAllOfValuesOverrideFile } from 'qovery-typescript-axios'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { GitBranchSettings, GitProviderSetting, GitRepositorySetting } from '@qovery/domains/organizations/feature'
import { type HelmValuesFileData, ValuesOverrideFilesSetting } from '@qovery/domains/service-helm/feature'
import { AutoDeploySetting, useEditService, useService } from '@qovery/domains/services/feature'
import { isHelmRepositorySource } from '@qovery/shared/enums'
import { Button, Callout, Icon, IconAwesomeEnum, InputText } from '@qovery/shared/ui'
import { getGitTokenValue, guessGitProvider } from '@qovery/shared/util-git'
import { buildGitRepoUrl } from '@qovery/shared/util-js'
import { buildEditServicePayload } from '@qovery/shared/util-services'

export function PageSettingsValuesOverrideFileFeature() {
  const { environmentId = '', applicationId = '' } = useParams()
  const { data: service } = useService({ serviceId: applicationId, serviceType: 'HELM' })
  const { mutate: editService, isLoading: isLoadingEditService } = useEditService({ environmentId })

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
      repository:
        valuesOverrideFile?.git?.git_repository?.name ?? valuesOverrideFile?.git?.git_repository?.git_token_id,
      branch: valuesOverrideFile?.git?.git_repository?.branch,
      paths: valuesOverrideFile?.git?.paths?.toString(),
    },
  })

  const watchFieldType = methods.watch('type')
  const watchFieldGitProvider = methods.watch('provider')
  const watchFieldGitRepository = methods.watch('repository')

  const disabledContinueButton = match(watchFieldType)
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
        const gitToken = getGitTokenValue(data['provider']!)

        return {
          git: {
            git_repository: {
              url: buildGitRepoUrl(data['provider']!, data['repository']!),
              branch: data['branch'] ?? '',
              git_token_id: gitToken?.id,
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
      {watchFieldGitProvider && <GitRepositorySetting gitProvider={watchFieldGitProvider} />}
      {watchFieldGitProvider && watchFieldGitRepository && (
        <>
          <GitBranchSettings gitProvider={watchFieldGitProvider} hideRootPath />
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
            <p className="text-xs text-neutral-350 ml-4 mt-1">
              Specify multiple paths by separating them with a semi-colon
            </p>
          </div>
          {isHelmRepositorySource(service?.source) ? (
            <AutoDeploySetting source="GIT" className="mt-3" />
          ) : service?.auto_deploy ? (
            <Callout.Root color="sky" className="mt-3">
              <Callout.Icon>
                <Icon name={IconAwesomeEnum.CIRCLE_INFO} />
              </Callout.Icon>

              <Callout.Text className="text-xs">
                <Callout.TextHeading>Auto-deploy is activated</Callout.TextHeading>
                The service will be automatically updated on every new commit on the branch.
              </Callout.Text>
            </Callout.Root>
          ) : (
            <Callout.Root color="sky" className="mt-3">
              <Callout.Icon>
                <Icon name={IconAwesomeEnum.CIRCLE_INFO} />
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
    <div className="flex flex-col justify-between w-full p-8 max-w-content-with-navigation-left">
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
            <div className="flex justify-end mt-10">
              <Button type="submit" size="lg" loading={isLoadingEditService} disabled={disabledContinueButton}>
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
