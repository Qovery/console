import { useParams } from '@tanstack/react-router'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { type Terraform } from '@qovery/domains/services/data-access'
import { useEditService, useService } from '@qovery/domains/services/feature'
import { DropdownVariable } from '@qovery/domains/variables/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Button, Heading, Icon, InputText, Section } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { buildEditServicePayload } from '@qovery/shared/util-services'

const DELIMETER = ' '
const commands = [
  {
    name: 'init',
    description: 'Prepare your working directory for other commands.',
    hint: (
      <div>
        Example:{' '}
        <code className="rounded bg-surface-neutral-component px-1 py-0.5 text-2xs text-neutral-subtle">
          -lock=false -upgrade
        </code>
        . Arguments are separated by a space.
      </div>
    ),
  },
  {
    name: 'validate',
    description: 'Check whether the configuration is valid.',
    hint: (
      <div>
        Example:{' '}
        <code className="rounded bg-surface-neutral-component px-1 py-0.5 text-2xs text-neutral-subtle">-json</code> or{' '}
        <code className="rounded bg-surface-neutral-component px-1 py-0.5 text-2xs text-neutral-subtle">-no-color</code>
        . Arguments are separated by a space.
      </div>
    ),
  },
  {
    name: 'plan',
    description: 'Show changes required by the current configuration.',
    hint: (
      <div>
        Example:{' '}
        <code className="rounded bg-surface-neutral-component px-1 py-0.5 text-2xs text-neutral-subtle">
          -refresh=false
        </code>
        . Arguments are separated by a space.
      </div>
    ),
  },
  {
    name: 'apply',
    description: 'Create or update infrastructure.',
    hint: (
      <div>
        Example:{' '}
        <code className="rounded bg-surface-neutral-component px-1 py-0.5 text-2xs text-neutral-subtle">
          -auto-approve
        </code>
        . Arguments are separated by a space.
      </div>
    ),
  },
  {
    name: 'destroy',
    description: 'Destroy previously-created infrastructure.',
    hint: (
      <div>
        Example:{' '}
        <code className="rounded bg-surface-neutral-component px-1 py-0.5 text-2xs text-neutral-subtle">-target</code>.
        Arguments are separated by a space.
      </div>
    ),
  },
]

const TerraformArgumentsSettingsContent = ({ service }: { service: Terraform }) => {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  const { mutate: editService, isLoading: isLoadingEditService } = useEditService({
    organizationId,
    projectId,
    environmentId,
  })

  const defaultValues = Object.fromEntries(
    commands.map((command) => [
      command.name,
      service && 'action_extra_arguments' in service ? service.action_extra_arguments?.[command.name] ?? [] : [],
    ])
  )

  const methods = useForm<Record<string, string[]>>({
    mode: 'onChange',
    defaultValues,
  })

  const onSubmit = methods.handleSubmit((data) => {
    if (!data) return

    const payload = buildEditServicePayload({
      service,
      request: {
        action_extra_arguments: {
          init: data['init'] ?? [],
          validate: data['validate'] ?? [],
          plan: data['plan'] ?? [],
          apply: data['apply'] ?? [],
          destroy: data['destroy'] ?? [],
        },
      },
    })

    editService({
      serviceId: service.id,
      payload,
    })
  })

  return (
    <FormProvider {...methods}>
      <Section className="px-8 pb-8 pt-6">
        <SettingsHeading
          title="Terraform arguments"
          description="Configure the arguments passed to each Terraform command."
        />
        <div className="max-w-content-with-navigation-left space-y-10">
          <Section className="gap-4">
            <div className="space-y-1">
              <Heading level={2}>Commands</Heading>
              <p className="text-sm text-neutral-subtle">Specify additional arguments for each Terraform command.</p>
            </div>

            {commands.map((command) => (
              <div key={command.name} className="space-y-4 rounded-lg border border-neutral bg-surface-neutral p-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium capitalize text-neutral">{command.name}</p>
                  <p className="text-sm text-neutral-subtle">{command.description}</p>
                </div>
                <Controller
                  name={`${command.name}`}
                  control={methods.control}
                  render={({ field }) => (
                    <InputText
                      name={field.name}
                      value={field.value?.join(DELIMETER)}
                      onChange={(e) => field.onChange(e.target.value.split(DELIMETER).filter((arg) => arg !== ''))}
                      label={`Arguments for ${command.name}`}
                      hint={command.hint}
                      rightElement={
                        <DropdownVariable
                          environmentId={environmentId}
                          onChange={(val) => {
                            const currentValue = field.value?.join(DELIMETER) || ''
                            const newValue = currentValue ? `${currentValue} {{${val}}}` : `{{${val}}}`
                            field.onChange(newValue.split(DELIMETER).filter((arg) => arg !== ''))
                          }}
                        >
                          <button
                            className={twMerge(
                              'flex items-center justify-center border-none bg-transparent px-1 text-neutral-subtle hover:text-neutral'
                            )}
                            type="button"
                          >
                            <Icon className="text-sm" iconName="wand-magic-sparkles" />
                          </button>
                        </DropdownVariable>
                      }
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
      </Section>
    </FormProvider>
  )
}

export function TerraformArgumentsSettings() {
  const { serviceId = '' } = useParams({ strict: false })
  const { data: service } = useService({ serviceId, suspense: true })

  if (service?.serviceType !== 'TERRAFORM') return null

  return <TerraformArgumentsSettingsContent service={service} />
}
