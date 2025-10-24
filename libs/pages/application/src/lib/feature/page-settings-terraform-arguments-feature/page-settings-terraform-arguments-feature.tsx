import { type TerraformRequest, type TerraformRequestProviderEnum } from 'qovery-typescript-axios'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { type TerraformGeneralData } from '@qovery/domains/service-terraform/feature'
import { useEditService, useService } from '@qovery/domains/services/feature'
import { NeedHelp } from '@qovery/shared/assistant/feature'
import { Button, Heading, InputText, Section } from '@qovery/shared/ui'

const DELIMETER = ' '
const commands = [
  {
    name: 'init',
    description: 'Prepare your working directory for other commands.',
    hint: (
      <div>
        Example:{' '}
        <code className="rounded bg-neutral-150 px-1 py-0.5 text-2xs text-neutral-350">-lock=false -upgrade</code>.
        Arguments are separated by a space.
      </div>
    ),
  },
  {
    name: 'validate',
    description: 'Check whether the configuration is valid.',
    hint: (
      <div>
        Example: <code className="rounded bg-neutral-150 px-1 py-0.5 text-2xs text-neutral-350">-json</code> or{' '}
        <code className="rounded bg-neutral-150 px-1 py-0.5 text-2xs text-neutral-350">-no-color</code>. Arguments are
        separated by a space.
      </div>
    ),
  },
  {
    name: 'plan',
    description: 'Show changes required by the current configuration.',
    hint: (
      <div>
        Example: <code className="rounded bg-neutral-150 px-1 py-0.5 text-2xs text-neutral-350">-refresh=false</code>.
        Arguments are separated by a space.
      </div>
    ),
  },
  {
    name: 'apply',
    description: 'Create or update infrastructure.',
    hint: (
      <div>
        Example: <code className="rounded bg-neutral-150 px-1 py-0.5 text-2xs text-neutral-350">-auto-approve</code>.
        Arguments are separated by a space.
      </div>
    ),
  },
  {
    name: 'destroy',
    description: 'Destroy previously-created infrastructure.',
    hint: (
      <div>
        Example: <code className="rounded bg-neutral-150 px-1 py-0.5 text-2xs text-neutral-350">-target</code>.
        Arguments are separated by a space.
      </div>
    ),
  },
]

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
      .with({ serviceType: 'TERRAFORM' }, (s) => ({ ...s, state: 'kubernetes' }))
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
            <NeedHelp />
          </Section>

          <Section className="gap-4">
            <div className="space-y-1">
              <Heading level={2}>Commands</Heading>
              <p className="text-sm text-neutral-350">Specify additional arguments for each Terraform command.</p>
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
                      value={field.value?.join(DELIMETER)}
                      onChange={(e) => field.onChange(e.target.value.split(DELIMETER).filter((arg) => arg !== ''))}
                      label={`Arguments for ${command.name}`}
                      hint={command.hint}
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
