import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import {
  GitBranchSettings,
  GitProviderSetting,
  GitRepositorySetting,
  getGitProvider,
  getGitTokenValue,
} from '@qovery/domains/organizations/feature'
import {
  type HelmValuesFileData,
  ValuesOverrideFilesSetting,
  type ValuesOverrideTypes,
} from '@qovery/domains/service-helm/feature'
import { type Helm, refactoHelm } from '@qovery/domains/services/data-access'
import { useEditService, useHelmService } from '@qovery/domains/services/feature'
import { Button, InputText } from '@qovery/shared/ui'
import { buildGitRepoUrl } from '@qovery/shared/util-js'

export function PageSettingsValuesOverrideFileFeature() {
  const { environmentId = '', applicationId = '' } = useParams()
  const { data: service } = useHelmService({ serviceId: applicationId })
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
      provider: getGitProvider(valuesOverrideFile?.git?.git_repository?.url ?? ''),
      repository: valuesOverrideFile?.git?.git_repository?.url,
      branch: valuesOverrideFile?.git?.git_repository?.branch,
      paths: valuesOverrideFile?.git?.paths?.toString(),
    },
  })

  const watchFieldType: ValuesOverrideTypes = methods.watch('type')
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
    const valuesOverrideFile = match(watchFieldType)
      .with('GIT_REPOSITORY', () => {
        const gitProvider = getGitProvider(data['repository']!)
        const gitToken = getGitTokenValue(gitProvider ?? '')

        return {
          git_repository: {
            url: buildGitRepoUrl(gitProvider ?? '', data['repository']!),
            branch: data['branch'],
            git_token_id: gitToken?.id,
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

    editService({
      serviceId: applicationId,
      payload: {
        ...service,
        values_override: {
          ...service?.values_override,
          file: valuesOverrideFile,
        },
      } as Helm,
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
        </>
      )}
    </>
  )

  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8 max-w-content-with-navigation-left">
        <FormProvider {...methods}>
          <ValuesOverrideFilesSetting
            methods={methods}
            watchFieldType={watchFieldType}
            source={refactoHelm(service!).source}
            gitRepositorySettings={gitRepositorySettings}
            onSubmit={onSubmit}
          >
            <div className="flex justify-end mt-10">
              <Button type="submit" size="lg" loading={isLoadingEditService} disabled={disabledContinueButton}>
                Save
              </Button>
            </div>
          </ValuesOverrideFilesSetting>
        </FormProvider>
      </div>
    </div>
  )
}

export default PageSettingsValuesOverrideFileFeature
