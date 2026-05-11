import { useParams } from '@tanstack/react-router'
import { FormProvider, useForm } from 'react-hook-form'
import {
  type ArgumentTypes,
  type HelmValuesArgumentsData,
  ValuesOverrideArgumentsSetting,
} from '@qovery/domains/service-helm/feature'
import { useEditService, useService } from '@qovery/domains/services/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Button, Section } from '@qovery/shared/ui'
import { buildEditServicePayload } from '@qovery/shared/util-services'

const generateArguments = (
  type: ArgumentTypes,
  values?: string[][]
): { key: string; type: ArgumentTypes; value: string; json?: string }[] => {
  if (!values) {
    return []
  }

  return values.map(([key, value]) =>
    type === '--set-json'
      ? {
          key,
          type,
          value,
          json: value,
        }
      : {
          key,
          type,
          value,
        }
  )
}

export function HelmValuesOverrideArgumentsSettings() {
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = useParams({ strict: false })
  const { data: service } = useService({ serviceId, serviceType: 'HELM', suspense: true })
  const { mutate: editService, isLoading: isLoadingEditService } = useEditService({
    organizationId,
    projectId,
    environmentId,
  })

  const methods = useForm<HelmValuesArgumentsData>({
    mode: 'onChange',
    defaultValues: {
      arguments: [
        ...generateArguments('--set', service?.values_override.set),
        ...generateArguments('--set-string', service?.values_override.set_string),
        ...generateArguments('--set-json', service?.values_override.set_json),
      ],
    },
  })

  const onSubmit = methods.handleSubmit((data) => {
    if (!service) {
      return
    }

    const getValuesByType = (type: ArgumentTypes) =>
      data.arguments
        .filter((argument) => argument.type === type)
        .map((argument) => [argument.key, argument.json ?? argument.value])

    editService({
      serviceId,
      payload: buildEditServicePayload({
        service,
        request: {
          values_override: {
            set: getValuesByType('--set'),
            set_string: getValuesByType('--set-string'),
            set_json: getValuesByType('--set-json'),
            file: service.values_override.file,
          },
        },
      }),
    })
  })

  const addEmptyArgument = () => {
    methods.setValue(
      'arguments',
      [
        ...methods.getValues('arguments'),
        {
          key: '',
          type: '--set',
          value: '',
        },
      ],
      {
        shouldDirty: true,
        shouldValidate: true,
      }
    )
  }

  if (!service) {
    return null
  }

  return (
    <FormProvider {...methods}>
      <Section className="px-8 pb-8 pt-6">
        <SettingsHeading
          title="Value override as arguments"
          description="Specify each override by declaring the variable name, value and its type."
        >
          <Button className="gap-2" size="md" type="button" onClick={addEmptyArgument}>
            Add Variable
          </Button>
        </SettingsHeading>
        <div className="max-w-content-with-navigation-left">
          <form onSubmit={onSubmit} className="space-y-10">
            <ValuesOverrideArgumentsSetting
              onSubmit={onSubmit}
              methods={methods}
              source={buildEditServicePayload({ service }).source}
              isSetting
            />
            <div className="mt-10 flex justify-end">
              <Button type="submit" size="lg" loading={isLoadingEditService} disabled={!methods.formState.isValid}>
                Save
              </Button>
            </div>
          </form>
        </div>
      </Section>
    </FormProvider>
  )
}

export default HelmValuesOverrideArgumentsSettings
