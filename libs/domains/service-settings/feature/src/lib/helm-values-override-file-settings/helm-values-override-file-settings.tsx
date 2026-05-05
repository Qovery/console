import { useParams } from '@tanstack/react-router'
import { type HelmRequestAllOfValuesOverrideFile } from 'qovery-typescript-axios'
import { Controller, FormProvider, type UseFormReturn, useForm } from 'react-hook-form'
import { match } from 'ts-pattern'
import {
  GitBranchSettings,
  GitProviderSetting,
  GitPublicRepositorySettings,
  GitRepositorySetting,
} from '@qovery/domains/organizations/feature'
import {
  type HelmValuesFileData,
  ValuesOverrideFilesSetting,
  splitHelmOverridePaths,
} from '@qovery/domains/service-helm/feature'
import { AutoDeploySetting, useEditService, useService } from '@qovery/domains/services/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { isHelmRepositorySource } from '@qovery/shared/enums'
import { Button, Callout, Icon, InputText, Section } from '@qovery/shared/ui'
import { guessGitProvider } from '@qovery/shared/util-git'
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
      <p className="ml-4 mt-1 text-xs text-neutral-subtle">
        Specify multiple paths by separating them with a semi-colon
      </p>
    </div>
  )
}

export function HelmValuesOverrideFileSettings() {
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = useParams({ strict: false })
  const { data: service } = useService({ serviceId, serviceType: 'HELM', suspense: true })
  const { mutate: editService, isLoading: isLoadingEditService } = useEditService({
    organizationId,
    projectId,
    environmentId,
  })

  const valuesOverrideFile = service?.values_override.file
  const isPublicRepository = Boolean(
    valuesOverrideFile?.git?.git_repository?.url && !valuesOverrideFile?.git?.git_repository?.name
  )
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
      provider:
        valuesOverrideFile?.git?.git_repository?.provider ??
        guessGitProvider(valuesOverrideFile?.git?.git_repository?.url ?? ''),
      git_token_id:
        valuesOverrideFile?.git?.git_repository?.git_token_id === null
          ? undefined
          : valuesOverrideFile?.git?.git_repository?.git_token_id,
      repository: isPublicRepository
        ? valuesOverrideFile?.git?.git_repository?.url
        : valuesOverrideFile?.git?.git_repository?.name,
      git_repository: isPublicRepository ? undefined : valuesOverrideFile?.git?.git_repository,
      is_public_repository: isPublicRepository,
      branch: valuesOverrideFile?.git?.git_repository?.branch,
      paths: valuesOverrideFile?.git?.paths?.join('; '),
    },
  })

  const watchFieldType = methods.watch('type')
  const watchFieldGitProvider = methods.watch('provider')
  const watchFieldGitTokenId = methods.watch('git_token_id')
  const watchFieldGitRepository = methods.watch('git_repository')
  const watchFieldIsPublicRepository = methods.watch('is_public_repository')
  const watchFieldGitBranch = methods.watch('branch')

  const disabledSaveButton = match(watchFieldType)
    .with('GIT_REPOSITORY', () => {
      const { provider, git_repository, repository, branch, paths, is_public_repository } = methods.watch()
      const hasRepository = is_public_repository ? Boolean(repository) : Boolean(git_repository)
      return !provider || !hasRepository || !branch || !paths
    })
    .with('YAML', () => {
      const { content } = methods.watch()
      return !content
    })
    .with('NONE', () => false)
    .exhaustive()

  const onSubmit = methods.handleSubmit((data) => {
    if (!service) {
      return
    }

    const nextValuesOverrideFile: HelmRequestAllOfValuesOverrideFile | undefined = match(data.type)
      .with('GIT_REPOSITORY', () => ({
        git: {
          git_repository: {
            provider: data.provider ?? 'GITHUB',
            url: match(data.is_public_repository)
              .with(true, () => data.repository ?? '')
              .with(false, undefined, () => data.git_repository?.url ?? '')
              .exhaustive(),
            branch: data.branch ?? '',
            git_token_id: data.git_token_id,
          },
          paths: splitHelmOverridePaths(data.paths),
        },
      }))
      .with('YAML', () => ({
        raw: {
          values: [
            {
              name: 'override',
              content: data.content!,
            },
          ],
        },
      }))
      .with('NONE', () => undefined)
      .exhaustive()

    const nextService = {
      ...service,
      auto_deploy: data.is_public_repository ? false : (service.auto_deploy ?? false) || (data.auto_deploy ?? false),
    }

    editService({
      serviceId,
      payload: buildEditServicePayload({
        service: nextService,
        request: {
          values_override: {
            ...service.values_override,
            file: nextValuesOverrideFile,
          },
        },
      }),
    })
  })

  const gitRepositorySettings = (
    <>
      <GitProviderSetting organizationId={organizationId} />
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
          {watchFieldGitProvider ? (
            <GitRepositorySetting
              organizationId={organizationId}
              gitProvider={watchFieldGitProvider}
              gitTokenId={watchFieldGitTokenId}
            />
          ) : null}
          {watchFieldGitProvider && watchFieldGitRepository ? (
            <>
              <GitBranchSettings
                organizationId={organizationId}
                gitProvider={watchFieldGitProvider}
                gitTokenId={watchFieldGitTokenId}
                hideRootPath
              />
              {watchFieldGitBranch ? <GitPathsSettings methods={methods} /> : null}
            </>
          ) : null}
          {watchFieldGitProvider ? (
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
          ) : null}
        </>
      )}
    </>
  )

  if (!service) {
    return null
  }

  return (
    <FormProvider {...methods}>
      <Section className="px-8 pb-8 pt-6">
        <SettingsHeading
          title="Values override as file"
          description="Define the YAML file(s) to be applied as override to the default values.yaml delivered with the chart. It is highly recommended to store the override file(s) in a git repository."
        />
        <div className="max-w-content-with-navigation-left">
          <form onSubmit={onSubmit} className="space-y-10">
            <ValuesOverrideFilesSetting
              methods={methods}
              watchFieldType={watchFieldType}
              source={buildEditServicePayload({ service }).source}
              gitRepositorySettings={gitRepositorySettings}
              onSubmit={onSubmit}
              isSetting
            />
            {methods.watch('type') !== 'YAML' ? (
              <div className="mt-10 flex justify-end">
                <Button type="submit" size="lg" loading={isLoadingEditService} disabled={disabledSaveButton}>
                  Save
                </Button>
              </div>
            ) : null}
          </form>
        </div>
      </Section>
    </FormProvider>
  )
}

export default HelmValuesOverrideFileSettings
