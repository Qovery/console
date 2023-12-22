import { BuildModeEnum, BuildPackLanguageEnum, type Organization } from 'qovery-typescript-axios'
import { type FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { match } from 'ts-pattern'
import { DeploymentSetting, SourceSetting } from '@qovery/domains/service-helm/feature'
import { type AnyService } from '@qovery/domains/services/data-access'
import { AutoDeploySetting, GeneralSetting } from '@qovery/domains/services/feature'
import {
  EditGitRepositorySettingsFeature,
  EntrypointCmdInputs,
  GeneralContainerSettings,
  JobGeneralSettings,
} from '@qovery/shared/console-shared'
import { ServiceTypeEnum, isJobGitSource } from '@qovery/shared/enums'
import { BlockContent, Button, HelpSection, InputSelect, InputText } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'

export interface PageSettingsGeneralProps {
  service?: AnyService
  isLoadingEditService?: boolean
  onSubmit: FormEventHandler<HTMLFormElement>
  organization?: Organization
}

const buildModeItems = Object.values(BuildModeEnum).map((value) => ({
  label: upperCaseFirstLetter(value),
  value: value,
}))

const languageItems = Object.values(BuildPackLanguageEnum).map((value) => ({
  label: upperCaseFirstLetter(value),
  value: value,
}))

export function PageSettingsGeneral({
  onSubmit,
  service,
  isLoadingEditService,
  organization,
}: PageSettingsGeneralProps) {
  const { control, formState, watch } = useFormContext()
  const watchServiceType = watch('serviceType')
  const watchBuildMode = watch('build_mode')
  const watchFieldProvider = watch('source_provider')

  const blockContentBuildDeploy = (
    <BlockContent classNameContent="gap-3 flex flex-col" title="Build & deploy">
      <Controller
        name="build_mode"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <InputSelect
            dataTestId="input-select-mode"
            label="Mode"
            options={buildModeItems}
            onChange={field.onChange}
            value={field.value}
            error={error?.message}
            disabled={service?.serviceType === 'JOB'}
          />
        )}
      />
      {watchBuildMode === BuildModeEnum.BUILDPACKS ? (
        <Controller
          name="buildpack_language"
          control={control}
          rules={{
            required: 'Please enter your buildpack language.',
          }}
          render={({ field, fieldState: { error } }) => (
            <InputSelect
              dataTestId="input-select-language"
              label="Language framework"
              options={languageItems}
              onChange={field.onChange}
              value={field.value}
              error={error?.message}
            />
          )}
        />
      ) : (
        <Controller
          name="dockerfile_path"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <InputText
              dataTestId="input-text-dockerfile"
              name={field.name}
              onChange={field.onChange}
              value={field.value}
              label="Dockerfile path"
              error={error?.message}
            />
          )}
        />
      )}
    </BlockContent>
  )

  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-8 max-w-content-with-navigation-left">
        <h2 className="h5 mb-8 text-neutral-400">General settings</h2>
        <form onSubmit={onSubmit}>
          <BlockContent title="General information">
            <GeneralSetting label="Application name" />
          </BlockContent>
          {match(service)
            .with({ serviceType: 'JOB' }, (job) => (
              <>
                <JobGeneralSettings
                  isEdition={true}
                  jobType={job.job_type === 'CRON' ? ServiceTypeEnum.CRON_JOB : ServiceTypeEnum.LIFECYCLE_JOB}
                  organization={organization}
                />
                {isJobGitSource(job.source) ? (
                  <>
                    <EditGitRepositorySettingsFeature />
                    {blockContentBuildDeploy}
                  </>
                ) : (
                  <BlockContent title="Container Settings">
                    <GeneralContainerSettings organization={organization} />
                  </BlockContent>
                )}
                <BlockContent title="Auto-deploy">
                  <AutoDeploySetting source={watchServiceType === 'CONTAINER' ? 'CONTAINER_REGISTRY' : 'GIT'} />
                </BlockContent>
              </>
            ))
            .with({ serviceType: 'APPLICATION' }, () => (
              <>
                <EditGitRepositorySettingsFeature />
                {blockContentBuildDeploy}
                {watchBuildMode === BuildModeEnum.DOCKER && (
                  <BlockContent title="Entrypoint and arguments">
                    <EntrypointCmdInputs />
                  </BlockContent>
                )}

                <BlockContent title="Auto-deploy">
                  <AutoDeploySetting source="GIT" />
                </BlockContent>
              </>
            ))
            .with({ serviceType: 'CONTAINER' }, () => (
              <>
                <BlockContent title="Container Settings">
                  <GeneralContainerSettings organization={organization} />
                </BlockContent>
                <BlockContent title="Entrypoint and arguments">
                  <EntrypointCmdInputs />
                </BlockContent>
                <BlockContent title="Auto-deploy">
                  <AutoDeploySetting source="CONTAINER_REGISTRY" />
                </BlockContent>
              </>
            ))
            .with({ serviceType: 'HELM' }, () => (
              <>
                <BlockContent title="Source">
                  <SourceSetting disabled />
                  {watchFieldProvider === 'GIT' && (
                    <div className="mt-3">
                      <EditGitRepositorySettingsFeature withBlockWrapper={false} />
                    </div>
                  )}
                </BlockContent>
                <BlockContent title="Deploy">
                  <DeploymentSetting />
                  {watchFieldProvider === 'GIT' && <AutoDeploySetting source="GIT" className="mt-5" />}
                </BlockContent>
              </>
            ))
            .otherwise(() => null)}

          <div className="flex justify-end">
            <Button type="submit" size="lg" loading={isLoadingEditService} disabled={!formState.isValid}>
              Save
            </Button>
          </div>
        </form>
      </div>
      <HelpSection
        description="Need help? You may find these links useful"
        links={match(service?.serviceType)
          .with('HELM', () => [
            {
              link: 'https://hub.qovery.com/docs/using-qovery/configuration/helm/',
              linkLabel: 'How to manage my Helm chart',
            },
          ])
          .otherwise(() => [
            {
              link: 'https://hub.qovery.com/docs/using-qovery/configuration/application',
              linkLabel: 'How to manage my application',
            },
          ])}
      />
    </div>
  )
}

export default PageSettingsGeneral
