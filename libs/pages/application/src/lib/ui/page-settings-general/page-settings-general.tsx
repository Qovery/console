import { BuildModeEnum, type Organization } from 'qovery-typescript-axios'
import { type FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { match } from 'ts-pattern'
import { AnnotationSetting, LabelSetting } from '@qovery/domains/organizations/feature'
import { DeploymentSetting, SourceSetting } from '@qovery/domains/service-helm/feature'
import { type AnyService } from '@qovery/domains/services/data-access'
import { AutoDeploySetting, GeneralSetting } from '@qovery/domains/services/feature'
import {
  EditGitRepositorySettingsFeature,
  EntrypointCmdInputs,
  GeneralContainerSettings,
  JobGeneralSettings,
  SettingsHeading,
} from '@qovery/shared/console-shared'
import { ServiceTypeEnum, isJobGitSource } from '@qovery/shared/enums'
import { Button, Callout, Heading, Icon, InputSelect, InputText, Section } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'

export interface PageSettingsGeneralProps {
  service: AnyService
  isLoadingEditService?: boolean
  onSubmit: FormEventHandler<HTMLFormElement>
  organization?: Organization
}

const buildModeItems = Object.values(BuildModeEnum).map((value) => ({
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
  const watchBuildMode = watch('build_mode')
  const watchFieldProvider = watch('source_provider')
  const isLifecycleJob = service?.serviceType === 'JOB' && service.job_type === 'LIFECYCLE'

  const blockContentBuildDeploy = (
    <>
      {!isLifecycleJob && (
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
      )}

      {!isLifecycleJob && (
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
    </>
  )

  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="max-w-content-with-navigation-left p-8">
        <SettingsHeading
          title="General settings"
          description="These general settings allow you to set up the service name, its source and deployment parameters."
        />
        <form onSubmit={onSubmit} className="space-y-10">
          {service?.serviceType !== 'JOB' && (
            <Section className="gap-4">
              <Heading>General</Heading>
              <GeneralSetting label="Service name" service={service} />
            </Section>
          )}
          {match(service)
            .with({ serviceType: 'JOB' }, (job) => (
              <>
                <Section className="gap-4">
                  <Heading>General</Heading>
                  <GeneralSetting label="Service name" service={service} />
                </Section>
                <JobGeneralSettings
                  isEdition={true}
                  jobType={job.job_type === 'CRON' ? ServiceTypeEnum.CRON_JOB : ServiceTypeEnum.LIFECYCLE_JOB}
                  organization={organization}
                />
                <Section className="gap-4">
                  <Heading>Source</Heading>
                  {isJobGitSource(job.source) ? (
                    <EditGitRepositorySettingsFeature
                      rootPathLabel={match(job.job_type === 'LIFECYCLE' ? job.schedule.lifecycle_type : undefined)
                        .with('CLOUDFORMATION', () => 'Template folder path')
                        .with('TERRAFORM', () => 'Manifest folder path')
                        .with('GENERIC', undefined, () => undefined)
                        .exhaustive()}
                      rootPathHint={match(job.job_type === 'LIFECYCLE' ? job.schedule.lifecycle_type : undefined)
                        .with(
                          'CLOUDFORMATION',
                          () => 'Provide the folder path in the repository where the template is located'
                        )
                        .with(
                          'TERRAFORM',
                          () => 'Provide the folder path in the repository where the manifest is located'
                        )
                        .with('GENERIC', undefined, () => undefined)
                        .exhaustive()}
                    />
                  ) : (
                    <GeneralContainerSettings organization={organization} isSetting />
                  )}
                </Section>
                <Section className="gap-4">
                  <Heading>{isJobGitSource(job.source) ? 'Build and deploy' : 'Deploy'}</Heading>
                  {isJobGitSource(job.source) && blockContentBuildDeploy}
                  {job.job_type === 'CRON' && <EntrypointCmdInputs />}
                  <AutoDeploySetting source={isJobGitSource(job.source) ? 'GIT' : 'CONTAINER_REGISTRY'} />
                </Section>
                <Section className="gap-4">
                  <Heading>Extra labels/annotations</Heading>
                  <LabelSetting />
                  <AnnotationSetting />
                </Section>
              </>
            ))
            .with({ serviceType: 'APPLICATION' }, () => (
              <>
                <Section className="gap-4">
                  <Heading>Source</Heading>
                  <EditGitRepositorySettingsFeature />
                </Section>
                <Section className="gap-4">
                  <Heading>Build and deploy</Heading>
                  {blockContentBuildDeploy}
                  {watchBuildMode === BuildModeEnum.DOCKER && <EntrypointCmdInputs />}
                  <AutoDeploySetting source="GIT" />
                </Section>
                <Section className="gap-4">
                  <Heading>Extra labels/annotations</Heading>
                  <LabelSetting />
                  <AnnotationSetting />
                </Section>
              </>
            ))
            .with({ serviceType: 'CONTAINER' }, () => (
              <>
                <Section className="gap-4">
                  <Heading>Source</Heading>
                  <GeneralContainerSettings organization={organization} isSetting />
                </Section>
                <Section className="gap-4">
                  <Heading>Deploy</Heading>
                  <EntrypointCmdInputs />
                  <AutoDeploySetting source="CONTAINER_REGISTRY" />
                </Section>
                <Section className="gap-4">
                  <Heading>Extra labels/annotations</Heading>
                  <LabelSetting />
                  <AnnotationSetting />
                </Section>
              </>
            ))
            .with({ serviceType: 'HELM' }, () => (
              <>
                <Section className="gap-4">
                  <Heading>Source</Heading>
                  <SourceSetting disabled />
                  {watchFieldProvider === 'GIT' && (
                    <div className="mt-3">
                      <EditGitRepositorySettingsFeature />
                    </div>
                  )}
                </Section>
                <Section className="gap-4">
                  <Heading>Deploy</Heading>
                  <DeploymentSetting />
                  {watchFieldProvider === 'GIT' && <AutoDeploySetting source="GIT" />}
                  {watchFieldProvider === 'HELM_REPOSITORY' && (
                    <Callout.Root color="sky" className="mt-5 items-center">
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

          <div className="mt-10 flex justify-end">
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
