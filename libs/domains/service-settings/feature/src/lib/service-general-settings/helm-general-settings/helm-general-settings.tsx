import { type Organization } from 'qovery-typescript-axios'
import { useFormContext } from 'react-hook-form'
import { EditGitRepositorySettings } from '@qovery/domains/organizations/feature'
import { DeploymentSetting, SourceSetting } from '@qovery/domains/service-helm/feature'
import { type Helm } from '@qovery/domains/services/data-access'
import { AutoDeploySection, GeneralSetting } from '@qovery/domains/services/feature'
import { isHelmGitSource } from '@qovery/shared/enums'
import { Callout, Heading, Icon, Section } from '@qovery/shared/ui'

export interface HelmGeneralSettingsProps {
  service: Helm
  organization: Organization
}

export function HelmGeneralSettings({ service, organization }: HelmGeneralSettingsProps) {
  const { watch } = useFormContext()
  const watchFieldProvider = watch('source_provider')

  return (
    <>
      <Section className="gap-4">
        <Heading>General</Heading>
        <GeneralSetting label="Service name" service={service} />
      </Section>

      <Section className="gap-4">
        <Heading>Source</Heading>
        <SourceSetting disabled />
        {watchFieldProvider === 'GIT' && (
          <div className="mt-3">
            <EditGitRepositorySettings
              organizationId={organization.id}
              gitRepository={isHelmGitSource(service.source) ? service.source.git?.git_repository : undefined}
            />
          </div>
        )}
      </Section>

      <Section className="gap-4">
        <Heading>Deploy</Heading>
        <DeploymentSetting />
        {watchFieldProvider === 'GIT' && <AutoDeploySection serviceId={service.id} source="GIT" />}
        {watchFieldProvider === 'HELM_REPOSITORY' && (
          <Callout.Root color="sky" className="mt-5 items-center">
            <Callout.Icon>
              <Icon iconName="circle-info" iconStyle="regular" />
            </Callout.Icon>
            <Callout.Text>
              <Callout.TextHeading>
                Git automations are disabled when using Helm repositories (auto-deploy, automatic preview environments)
              </Callout.TextHeading>
            </Callout.Text>
          </Callout.Root>
        )}
      </Section>
    </>
  )
}

export default HelmGeneralSettings
