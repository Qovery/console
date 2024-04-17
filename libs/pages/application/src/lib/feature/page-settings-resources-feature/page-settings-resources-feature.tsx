import { type Environment } from 'qovery-typescript-axios'
import { type FieldValues, FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { type AnyService, type Database, type Helm } from '@qovery/domains/services/data-access'
import { useEditService, useService } from '@qovery/domains/services/feature'
import { buildEditServicePayload } from '@qovery/shared/util-services'
import PageSettingsResources from '../../ui/page-settings-resources/page-settings-resources'

export interface SettingsResourcesFeatureProps {
  service: Exclude<AnyService, Helm | Database>
  environment: Environment
}

export function SettingsResourcesFeature({ service, environment }: SettingsResourcesFeatureProps) {
  const { mutate: editService, isLoading: isLoadingService } = useEditService({ environmentId: environment.id })

  const defaultInstances = match(service)
    .with({ serviceType: 'JOB' }, () => ({}))
    .otherwise((s) => ({
      min_running_instances: s.min_running_instances || 1,
      max_running_instances: s.max_running_instances || 1,
    }))

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      memory: service.memory,
      cpu: service.cpu,
      ...defaultInstances,
    },
  })

  const onSubmit = methods.handleSubmit((data: FieldValues) => {
    const request = {
      memory: Number(data['memory']),
      cpu: data['cpu'],
    }

    let requestWithInstances = {}
    if (service.serviceType !== 'JOB') {
      requestWithInstances = {
        ...request,
        ...{
          min_running_instances: data['min_running_instances'],
          max_running_instances: data['max_running_instances'],
        },
      }
    }

    const payload = match(service)
      .with({ serviceType: 'JOB' }, (service) => buildEditServicePayload({ service, request }))
      .with({ serviceType: 'APPLICATION' }, (service) =>
        buildEditServicePayload({
          service,
          request: requestWithInstances,
        })
      )
      .with({ serviceType: 'CONTAINER' }, (service) =>
        buildEditServicePayload({
          service,
          request: requestWithInstances,
        })
      )
      .exhaustive()

    editService({
      serviceId: service.id,
      payload,
    })
  })

  const displayWarningCpu: boolean = (methods.watch('cpu') || 0) > (service.maximum_cpu || 0)

  return (
    <FormProvider {...methods}>
      <PageSettingsResources
        onSubmit={onSubmit}
        loading={isLoadingService}
        service={service}
        displayWarningCpu={displayWarningCpu}
      />
    </FormProvider>
  )
}

export function PageSettingsResourcesFeature() {
  const { environmentId = '', applicationId = '' } = useParams()

  const { data: environment } = useEnvironment({ environmentId })
  const { data: service } = useService({ environmentId, serviceId: applicationId })

  if (!environment) return null

  return match(service)
    .with({ serviceType: 'APPLICATION' }, { serviceType: 'CONTAINER' }, { serviceType: 'JOB' }, (service) => (
      <SettingsResourcesFeature service={service} environment={environment} />
    ))
    .otherwise(() => null)
}

export default PageSettingsResourcesFeature
