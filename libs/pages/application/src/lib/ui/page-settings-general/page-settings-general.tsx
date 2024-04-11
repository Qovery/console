import { BuildModeEnum, BuildPackLanguageEnum, type Organization } from 'qovery-typescript-axios'
import { type FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { match } from 'ts-pattern'
import { AnnotationSetting } from '@qovery/domains/organizations/feature'
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
import { Button, Callout, Heading, Icon, InputSelect, InputText, Section } from '@qovery/shared/ui'
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
    <>
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
        <>
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
          {service?.serviceType === 'JOB' && service.job_type === 'CRON' && <EntrypointCmdInputs />}
        </>
      )}
    </>
  )

  return (
    <div className="flex flex-col justify-between w-full">
      <Section className="p-8 max-w-content-with-navigation-left">
        <Heading className="mb-2">General settings</Heading>
        <p className="text-sm text-neutral-400 mb-8">
          These general settings allow you to set up the service name, its source and deployment parameters.
        </p>
        <form onSubmit={onSubmit}>
          <Section className="gap-4">
            <Heading>General</Heading>
            <GeneralSetting label="Service name" />
          </Section>
          {match(service)
            .with({ serviceType: 'JOB' }, (job) => (
              <>
                <JobGeneralSettings
                  isEdition={true}
                  jobType={job.job_type === 'CRON' ? ServiceTypeEnum.CRON_JOB : ServiceTypeEnum.LIFECYCLE_JOB}
                  organization={organization}
                />
                <Section className="gap-4 mt-10">
                  <Heading>Source</Heading>
                  {isJobGitSource(job.source) ? (
                    <EditGitRepositorySettingsFeature />
                  ) : (
                    <GeneralContainerSettings organization={organization} />
                  )}
                </Section>
                <Section className="gap-4 mt-10">
                  <Heading>Build and deploy</Heading>
                  {blockContentBuildDeploy}
                  <AutoDeploySetting source={watchServiceType === 'CONTAINER' ? 'CONTAINER_REGISTRY' : 'GIT'} />
                </Section>
                <Section className="gap-4 mt-10">
                  <Heading>Extra annotations</Heading>
                  <AnnotationSetting />
                </Section>
              </>
            ))
            .with({ serviceType: 'APPLICATION' }, () => (
              <>
                <Section className="gap-4 mt-10">
                  <Heading>Source</Heading>
                  <EditGitRepositorySettingsFeature />
                </Section>
                <Section className="gap-4 mt-10">
                  <Heading>Build and deploy</Heading>
                  {blockContentBuildDeploy}
                  {watchBuildMode === BuildModeEnum.DOCKER && <EntrypointCmdInputs />}
                  <AutoDeploySetting source="GIT" />
                </Section>
                <Section className="gap-4 mt-10">
                  <Heading>Extra annotations</Heading>
                  <AnnotationSetting />
                </Section>
              </>
            ))
            .with({ serviceType: 'CONTAINER' }, () => (
              <>
                <Section className="gap-4 mt-10">
                  <Heading>Source</Heading>
                  <GeneralContainerSettings organization={organization} />
                </Section>
                <Section className="gap-4 mt-10">
                  <Heading>Deploy</Heading>
                  <EntrypointCmdInputs />
                  <AutoDeploySetting source="CONTAINER_REGISTRY" />
                </Section>
                <Section className="gap-4 mt-10">
                  <Heading>Extra annotations</Heading>
                  <AnnotationSetting />
                </Section>
              </>
            ))
            .with({ serviceType: 'HELM' }, () => (
              <>
                <Section className="gap-4 mt-10">
                  <Heading>Source</Heading>
                  <SourceSetting disabled />
                  {watchFieldProvider === 'GIT' && (
                    <div className="mt-3">
                      <EditGitRepositorySettingsFeature />
                    </div>
                  )}
                </Section>
                <Section className="gap-4 mt-10">
                  <Heading>Deploy</Heading>
                  <DeploymentSetting />
                  {watchFieldProvider === 'GIT' && <AutoDeploySetting source="GIT" />}
                  {watchFieldProvider === 'HELM_REPOSITORY' && (
                    <Callout.Root color="sky" className="mt-5 text-xs items-center">
                      <Callout.Icon>
                        <Icon iconName="circle-info" iconStyle="regular" />
                      </Callout.Icon>
                      <Callout.Text>
                        <Callout.TextHeading>
                          Git automations are disabled when using Helm repositories (auto-deploy, automatic preview
                          environments)
                        </Callout.TextHeading>
                      </Callout.Text>
                    </Callout.Root>
                  )}
                </Section>
              </>
            ))
            .otherwise(() => null)}

          <div className="flex justify-end mt-10">
            <Button type="submit" size="lg" loading={isLoadingEditService} disabled={!formState.isValid}>
              Save
            </Button>
          </div>
        </form>
      </Section>
    </div>
  )
}

export default PageSettingsGeneral
