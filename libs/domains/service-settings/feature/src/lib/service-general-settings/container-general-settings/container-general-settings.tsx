import { type Organization } from 'qovery-typescript-axios'
import { AnnotationSetting, EditGitRepositorySettings, LabelSetting } from '@qovery/domains/organizations/feature'
import { type Container } from '@qovery/domains/services/data-access'
import {
  AutoDeploySection,
  EntrypointCmdInputs,
  GeneralContainerSettings,
  GeneralSetting,
} from '@qovery/domains/services/feature'
import { isContainerGitSource } from '@qovery/shared/enums'
import { Heading, InputText, Section } from '@qovery/shared/ui'

export interface ContainerGeneralSettingsProps {
  service: Container
  organization: Organization
  openContainerRegistryCreateEditModal: () => void
}

export function ContainerGeneralSettings({
  service,
  organization,
  openContainerRegistryCreateEditModal,
}: ContainerGeneralSettingsProps) {
  const gitRepository = isContainerGitSource(service.source) ? service.source.git_repository : undefined

  return (
    <>
      <Section className="gap-4">
        <Heading>General</Heading>
        <GeneralSetting label="Service name" service={service} />
      </Section>

      <Section className="gap-4">
        <Heading>Source</Heading>
        {gitRepository ? (
          <>
            <EditGitRepositorySettings
              organizationId={organization.id}
              gitRepository={gitRepository}
              showEditAction={false}
            />
            <InputText name="dockerfile_path" value={gitRepository.dockerfile_path} label="Dockerfile path" disabled />
            {gitRepository.docker_target_build_stage && (
              <InputText
                name="docker_target_build_stage"
                value={gitRepository.docker_target_build_stage}
                label="Dockerfile stage"
                disabled
              />
            )}
            <InputText
              name="running_image"
              value={`${service.image_name}:${service.tag}`}
              label="Running image"
              disabled
            />
          </>
        ) : (
          <GeneralContainerSettings
            organizationId={organization.id}
            isSetting
            openContainerRegistryCreateEditModal={openContainerRegistryCreateEditModal}
          />
        )}
      </Section>

      <Section className="gap-4">
        <Heading>Deploy</Heading>
        <EntrypointCmdInputs />
        <AutoDeploySection serviceId={service.id} source={gitRepository ? 'GIT' : 'CONTAINER_REGISTRY'} />
      </Section>

      <Section className="gap-4">
        <Heading>Extra labels/annotations</Heading>
        <LabelSetting />
        <AnnotationSetting />
      </Section>
    </>
  )
}

export default ContainerGeneralSettings
