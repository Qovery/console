import { useNavigate, useParams } from '@tanstack/react-router'
import { type Organization, TerraformAutoDeployConfigTerraformActionEnum } from 'qovery-typescript-axios'
import { Controller, useFormContext } from 'react-hook-form'
import { EditGitRepositorySettings } from '@qovery/domains/organizations/feature'
import { type Terraform } from '@qovery/domains/services/data-access'
import { AutoDeploySection, GeneralSetting, useBlueprintUpdate } from '@qovery/domains/services/feature'
import { Button, Callout, Heading, Icon, InputSelect, Section } from '@qovery/shared/ui'

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
          showEditAction={!service.blueprint_id}
        />
        {service.blueprint_id && <BlueprintUpdateSettings blueprintId={service.blueprint_id} />}
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

function BlueprintUpdateSettings({ blueprintId }: { blueprintId: string }) {
  const { data: blueprintUpdate } = useBlueprintUpdate({ blueprintId, suspense: true })
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = useParams({ strict: false })
  const navigate = useNavigate()

  if (!blueprintUpdate) return null

  const openBlueprintUpdate = () => {
    navigate({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/update/blueprint',
      params: { organizationId, projectId, environmentId, serviceId },
    })
  }

  return (
    <>
      {blueprintUpdate.new_major_versions?.length > 0 && (
        <div>
          <Button type="button" variant="plain" color="brand" size="md" onClick={openBlueprintUpdate}>
            New major version available
          </Button>
        </div>
      )}
      {!blueprintUpdate.is_up_to_date && (
        <Callout.Root color="sky" className="items-center">
          <Callout.Icon>
            <Icon iconName="circle-info" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text>New blueprint version available</Callout.Text>
          <Button type="button" size="sm" className="ml-auto" onClick={openBlueprintUpdate}>
            Update
          </Button>
        </Callout.Root>
      )}
    </>
  )
}

export default TerraformGeneralSettings
