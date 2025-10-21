import { type TerraformRequest, type TerraformRequestProviderEnum } from 'qovery-typescript-axios'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { type TerraformGeneralData } from '@qovery/domains/service-terraform/feature'
import { type Terraform } from '@qovery/domains/services/data-access'
import { useEditService, useService } from '@qovery/domains/services/feature'
import { Button, Heading, InputText, Section } from '@qovery/shared/ui'

const DELIMETER = ' '
const commands = [
  {
    name: 'init',
    description: 'Initialize the Terraform working directory and download required providers.',
  },
  {
    name: 'plan',
    description: 'Generate an execution plan for the changes to be made to the infrastructure.',
  },
  {
    name: 'apply',
    description: 'Apply the changes to the infrastructure.',
  },
  {
    name: 'destroy',
    description: 'Destroy the infrastructure.',
  },
]

const transform = (service: Terraform) => {
  console.log('🚀 ~ transform ~ service:', service)
  console.log(
    'commands',
    commands.map((command) => command.name)
  )

  const map = new Map<string, string[]>()
  commands.forEach((command) => {
    map.set(command.name, service.action_extra_arguments?.[command.name] ?? [])
  })

  console.log('MAP', map)

  // Transform the map to an object
  return Object.fromEntries(map.entries())
}

export function PageSettingsTerraformArgumentsFeature() {
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()
  const { data: service } = useService({ serviceId: applicationId })
  const { mutate: editService, isLoading: isLoadingEditService } = useEditService({
    organizationId,
    projectId,
    environmentId,
  })

  const methods = useForm<TerraformGeneralData>({
    mode: 'onChange',
    defaultValues: match(service)
      .with({ serviceType: 'TERRAFORM' }, (s) => ({ ...s, state: 'kubernetes', action_extra_arguments: transform(s) }))
      .otherwise(() => ({})),
  })

  const onSubmit = methods.handleSubmit((data) => {
    if (!service || !data) return

    if (service.serviceType === 'TERRAFORM') {
      const payload: TerraformRequest & { serviceType: 'TERRAFORM' } = {
        ...service,
        ...data,
        serviceType: 'TERRAFORM',
        terraform_files_source: {
          git_repository: {
            url: service.terraform_files_source?.git?.git_repository?.url ?? '',
            branch: service.terraform_files_source?.git?.git_repository?.branch ?? '',
            git_token_id: service.terraform_files_source?.git?.git_repository?.git_token_id ?? '',
          },
        },
        provider: 'TERRAFORM' as TerraformRequestProviderEnum,
        timeout_sec: Number(data.timeout_sec),
        terraform_variables_source: {
          tf_vars: [],
          tf_var_file_paths: [],
        },
      }

      editService({
        serviceId: service.id,
        payload,
      })
    }
  })

  return (
    <div className="flex w-full max-w-content-with-navigation-left flex-col p-8">
      <FormProvider {...methods}>
        <div className="space-y-10">
          <Section className="space-y-2">
            <Heading level={1}>Terraform arguments</Heading>
            <p className="text-sm text-neutral-350">Configure the arguments passed to each Terraform command.</p>
          </Section>

          <Section className="gap-4">
            <div className="space-y-1">
              <Heading level={2}>Commands</Heading>
              <p className="text-sm text-neutral-350">Specify any custom arguments to Terraform command.</p>
            </div>

            {commands.map((command) => (
              <div key={command.name} className="space-y-4 rounded border border-neutral-250 bg-neutral-100 p-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium capitalize text-neutral-400">{command.name}</p>
                  <p className="text-sm text-neutral-350">{command.description}</p>
                </div>
                <Controller
                  name={`action_extra_arguments.${command.name}`}
                  control={methods.control}
                  render={({ field }) => (
                    <InputText
                      name={field.name}
                      value={field.value.join(DELIMETER)}
                      onChange={(e) => field.onChange(e.target.value.split(DELIMETER))}
                      label={`Arguments for ${command.name}`}
                      hint="Expected format: -backend-config=path=terraform.tfstate"
                    />
                  )}
                />
              </div>
            ))}
          </Section>

          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              onClick={onSubmit}
              disabled={!methods.formState.isValid}
              loading={isLoadingEditService}
            >
              Save
            </Button>
          </div>
        </div>
      </FormProvider>
    </div>
  )
}
