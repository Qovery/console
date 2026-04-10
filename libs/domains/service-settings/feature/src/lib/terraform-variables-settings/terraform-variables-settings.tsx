import { Heading, Section } from '@qovery/shared/ui'
import { TerraformVariablesTable } from './terraform-variables-table/terraform-variables-table'

export const TerraformVariablesSettings = () => {
  return (
    <div className="space-y-10">
      <Section className="space-y-2">
        <Heading level={1}>Configure Terraform Variables</Heading>
        <p className="text-sm text-neutral-350">
          Select .tfvars files and configure variable values for your Terraform deployment
        </p>
      </Section>

      <TerraformVariablesTable />
    </div>
  )
}
