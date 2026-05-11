import { BuildModeEnum, type Organization } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { match } from 'ts-pattern'
import {
  AnnotationSetting,
  EditGitRepositorySettings,
  GitRepositorySettings,
  LabelSetting,
} from '@qovery/domains/organizations/feature'
import { type Job } from '@qovery/domains/services/data-access'
import {
  AutoDeploySection,
  EntrypointCmdInputs,
  GeneralContainerSettings,
  GeneralSetting,
  JobGeneralSettings as JobGeneralSettingsComponent,
} from '@qovery/domains/services/feature'
import { ServiceTypeEnum, isJobGitSource } from '@qovery/shared/enums'
import { Heading, InputSelect, InputText, Section } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'

const buildModeItems = Object.values(BuildModeEnum).map((value) => ({
  label: upperCaseFirstLetter(value),
  value,
}))

export interface JobGeneralSettingsProps {
  service: Job
  organization: Organization
  openContainerRegistryCreateEditModal: () => void
}

export function JobGeneralSettings({
  service,
  organization,
  openContainerRegistryCreateEditModal,
}: JobGeneralSettingsProps) {
  const { control } = useFormContext()
  const isLifecycleJob = service.job_type === 'LIFECYCLE'

  const buildContent = (
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
              disabled
            />
          )}
        />
      )}

      {!isLifecycleJob && (
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
          <Controller
            name="docker_target_build_stage"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <InputText
                name={field.name}
                onChange={field.onChange}
                value={field.value}
                label="Dockerfile stage (optional)"
                error={error?.message}
                hint="Specify the target stage to build in a multi-stage Dockerfile"
              />
            )}
          />
        </>
      )}
    </>
  )

  return (
    <>
      <Section className="gap-4">
        <Heading>General</Heading>
        <GeneralSetting label="Service name" service={service} />
      </Section>

      <JobGeneralSettingsComponent
        isEdition={true}
        jobType={service.job_type === 'CRON' ? ServiceTypeEnum.CRON_JOB : ServiceTypeEnum.LIFECYCLE_JOB}
        organization={organization}
        openContainerRegistryCreateEditModal={openContainerRegistryCreateEditModal}
        renderEditGitSettings={() => (
          <EditGitRepositorySettings
            organizationId={organization.id}
            gitRepository={isJobGitSource(service.source) ? service.source.docker?.git_repository : undefined}
          />
        )}
        renderGitRepositorySettings={({ organizationId, rootPathLabel, rootPathHint }) => (
          <GitRepositorySettings
            gitDisabled={false}
            organizationId={organizationId}
            rootPathLabel={rootPathLabel}
            rootPathHint={rootPathHint}
          />
        )}
      />

      <Section className="gap-4">
        <Heading>Source</Heading>
        {isJobGitSource(service.source) ? (
          <EditGitRepositorySettings
            organizationId={organization.id}
            gitRepository={service.source.docker?.git_repository}
            rootPathLabel={match(service.job_type === 'LIFECYCLE' ? service.schedule.lifecycle_type : undefined)
              .with('CLOUDFORMATION', () => 'Template folder path')
              .with('TERRAFORM', () => 'Manifest folder path')
              .with('GENERIC', undefined, () => undefined)
              .exhaustive()}
            rootPathHint={match(service.job_type === 'LIFECYCLE' ? service.schedule.lifecycle_type : undefined)
              .with('CLOUDFORMATION', () => 'Provide the folder path in the repository where the template is located')
              .with('TERRAFORM', () => 'Provide the folder path in the repository where the manifest is located')
              .with('GENERIC', undefined, () => undefined)
              .exhaustive()}
          />
        ) : (
          <GeneralContainerSettings
            organizationId={organization.id}
            isSetting
            openContainerRegistryCreateEditModal={openContainerRegistryCreateEditModal}
          />
        )}
      </Section>

      <Section className="gap-4">
        <Heading>{isJobGitSource(service.source) ? 'Build and deploy' : 'Deploy'}</Heading>
        {isJobGitSource(service.source) && buildContent}
        {service.job_type === 'CRON' && <EntrypointCmdInputs />}
        <AutoDeploySection
          serviceId={service.id}
          source={isJobGitSource(service.source) ? 'GIT' : 'CONTAINER_REGISTRY'}
        />
      </Section>

      <Section className="gap-4">
        <Heading>Extra labels/annotations</Heading>
        <LabelSetting />
        <AnnotationSetting />
      </Section>
    </>
  )
}

export default JobGeneralSettings
