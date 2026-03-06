import { type Organization, TerraformAutoDeployConfigTerraformActionEnum } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { EditGitRepositorySettings } from '@qovery/domains/organizations/feature'
import { type Terraform } from '@qovery/domains/services/data-access'
import { AutoDeploySection, GeneralSetting } from '@qovery/domains/services/feature'
import { Heading, InputSelect, Section } from '@qovery/shared/ui'

const triggeredActionItems = [
  { label: 'Plan & apply', value: TerraformAutoDeployConfigTerraformActionEnum.DEFAULT },
  { label: 'Plan', value: TerraformAutoDeployConfigTerraformActionEnum.PLAN },
  { label: 'Skip', value: TerraformAutoDeployConfigTerraformActionEnum.NOOP },
]

export interface TerraformGeneralSettingsProps {
  service: Terraform
  organization: Organization
}

export function TerraformGeneralSettings({ service, organization }: TerraformGeneralSettingsProps) {
  const { control } = useFormContext()

  return (
    <>
      <Section className="gap-4">
        <Heading>General</Heading>
        <GeneralSetting label="Service name" service={service} />
      </Section>

      <Section className="gap-4">
        <Heading>Source</Heading>
        <EditGitRepositorySettings
          organizationId={organization.id}
          gitRepository={service.terraform_files_source?.git?.git_repository}
          rootPathLabel="Terraform root folder path"
          rootPathHint="Provide the folder path where the Terraform code is located in the repository."
        />
      </Section>

      <Section className="gap-4">
        <Heading>Build and deploy</Heading>
        <AutoDeploySection serviceId={service.id} source="TERRAFORM">
          <Controller
            name="terraform_action"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <InputSelect
                label="Triggered action"
                options={triggeredActionItems}
                onChange={field.onChange}
                value={field.value}
                error={error?.message}
                portal
              />
            )}
          />
        </AutoDeploySection>
      </Section>
    </>
  )
}

export default TerraformGeneralSettings
