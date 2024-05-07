import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import {
  type ArgumentTypes,
  type HelmValuesArgumentsData,
  ValuesOverrideArgumentsSetting,
} from '@qovery/domains/service-helm/feature'
import { useEditService, useService } from '@qovery/domains/services/feature'
import { Button } from '@qovery/shared/ui'
import { buildEditServicePayload } from '@qovery/shared/util-services'

const generateArguments = (
  type: ArgumentTypes,
  values?: string[][]
): { key: string; type: ArgumentTypes; value: string }[] => {
  if (!values) {
    return []
  }

  return values.map(([key, value]) => {
    const argument: { key: string; type: ArgumentTypes; value: string; json?: string } = {
      key,
      type,
      value,
    }

    if (type === '--set-json') {
      argument.json = value
    }

    return argument
  })
}

export function PageSettingsValuesOverrideArgumentsFeature() {
  const { environmentId = '', applicationId = '' } = useParams()
  const { data: service } = useService({ serviceId: applicationId, serviceType: 'HELM' })
  const { mutate: editService, isLoading: isLoadingEditService } = useEditService({ environmentId })

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

    const getValuesByType = (type: ArgumentTypes) => {
      return data['arguments'].filter((a) => a.type === type).map((a) => [a.key, a.json ?? a.value])
    }

    editService({
      serviceId: applicationId,
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

  return (
    <div className="flex flex-col justify-between w-full p-8 max-w-content-with-navigation-left">
      <FormProvider {...methods}>
        <ValuesOverrideArgumentsSetting
          onSubmit={onSubmit}
          methods={methods}
          source={buildEditServicePayload({ service: service! }).source}
          isSetting
        >
          <div className="flex justify-end mt-10">
            <Button type="submit" size="lg" loading={isLoadingEditService} disabled={!methods.formState.isValid}>
              Save
            </Button>
          </div>
        </ValuesOverrideArgumentsSetting>
      </FormProvider>
    </div>
  )
}

export default PageSettingsValuesOverrideArgumentsFeature
