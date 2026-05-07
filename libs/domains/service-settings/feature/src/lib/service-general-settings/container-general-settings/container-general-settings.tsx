import { type Organization } from 'qovery-typescript-axios'
import { type ReactNode } from 'react'
import { AnnotationSetting, LabelSetting } from '@qovery/domains/organizations/feature'
import { type Container } from '@qovery/domains/services/data-access'
import {
  AutoDeploySection,
  EntrypointCmdInputs,
  GeneralContainerSettings,
  GeneralSetting,
} from '@qovery/domains/services/feature'
import { Heading, Section } from '@qovery/shared/ui'

export interface ContainerGeneralSettingsProps {
  service: Container
  organization: Organization
  openContainerRegistryCreateEditModal: () => void
  isBlueprintManaged?: boolean
  blueprintSection?: ReactNode
}

export function ContainerGeneralSettings({
  service,
  organization,
  openContainerRegistryCreateEditModal,
  isBlueprintManaged = false,
  blueprintSection,
}: ContainerGeneralSettingsProps) {
  return (
    <>
      <Section className="gap-4">
        <Heading>General</Heading>
        <GeneralSetting label="Service name" service={service} />
      </Section>

      {isBlueprintManaged ? (
        <Section className="gap-1">
          <Heading>Blueprint</Heading>
          {blueprintSection}
        </Section>
      ) : (
        <Section className="gap-4">
          <Heading>Source</Heading>
          <GeneralContainerSettings
            organizationId={organization.id}
            isSetting
            openContainerRegistryCreateEditModal={openContainerRegistryCreateEditModal}
          />
        </Section>
      )}

      {!isBlueprintManaged && (
        <Section className="gap-4">
          <Heading>Deploy</Heading>
          <EntrypointCmdInputs />
          <AutoDeploySection serviceId={service.id} source="CONTAINER_REGISTRY" />
        </Section>
      )}

      <Section className="gap-4">
        <Heading>Extra labels/annotations</Heading>
        <LabelSetting />
        <AnnotationSetting />
      </Section>
    </>
  )
}

export default ContainerGeneralSettings
