import { BuildModeEnum, type Organization } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { AnnotationSetting, EditGitRepositorySettings, LabelSetting } from '@qovery/domains/organizations/feature'
import { type Application } from '@qovery/domains/services/data-access'
import { AutoDeploySection, EntrypointCmdInputs, GeneralSetting } from '@qovery/domains/services/feature'
import { Heading, InputSelect, InputText, Section } from '@qovery/shared/ui'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'

const buildModeItems = Object.values(BuildModeEnum).map((value) => ({
  label: upperCaseFirstLetter(value),
  value,
}))

export interface ApplicationGeneralSettingsProps {
  service: Application
  organization: Organization
}

export function ApplicationGeneralSettings({ service, organization }: ApplicationGeneralSettingsProps) {
  const { control, watch } = useFormContext()
  const watchBuildMode = watch('build_mode')

  return (
    <>
      <Section className="gap-4">
        <Heading>General</Heading>
        <GeneralSetting label="Service name" service={service} />
      </Section>

      <Section className="gap-4">
        <Heading>Source</Heading>
        <EditGitRepositorySettings organizationId={organization.id} gitRepository={service.git_repository} />
      </Section>

      <Section className="gap-4">
        <Heading>Build and deploy</Heading>
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
            />
          )}
        />
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
        {watchBuildMode === BuildModeEnum.DOCKER && <EntrypointCmdInputs />}
        <AutoDeploySection serviceId={service.id} source="GIT" />
      </Section>

      <Section className="gap-4">
        <Heading>Extra labels/annotations</Heading>
        <LabelSetting />
        <AnnotationSetting />
      </Section>
    </>
  )
}

export default ApplicationGeneralSettings
