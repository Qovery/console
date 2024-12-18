import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import {
  type ArgumentTypes,
  type HelmValuesArgumentsData,
  ValuesOverrideArgumentsSetting,
} from '@qovery/domains/service-helm/feature'
import { useDeploymentStatus, useEditService, useService } from '@qovery/domains/services/feature'
import { DEPLOYMENT_LOGS_VERSION_URL, ENVIRONMENT_LOGS_URL } from '@qovery/shared/routes'
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
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()
  const { data: service } = useService({ serviceId: applicationId, serviceType: 'HELM' })
  const { data: deploymentStatus } = useDeploymentStatus({ environmentId, serviceId: applicationId })

  const { mutate: editService, isLoading: isLoadingEditService } = useEditService({
    environmentId,
    logsLink:
      ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId) +
      DEPLOYMENT_LOGS_VERSION_URL(service?.id, deploymentStatus?.execution_id),
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
    <div className="flex w-full max-w-content-with-navigation-left flex-col justify-between p-8">
      <FormProvider {...methods}>
        <ValuesOverrideArgumentsSetting
          onSubmit={onSubmit}
          methods={methods}
          source={buildEditServicePayload({ service: service! }).source}
          isSetting
        >
          <div className="mt-10 flex justify-end">
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
