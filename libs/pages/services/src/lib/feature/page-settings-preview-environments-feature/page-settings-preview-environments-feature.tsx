import { type EnvironmentDeploymentRule } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useEditEnvironmentDeploymentRule, useFetchEnvironmentDeploymentRule } from '@qovery/domains/environment'
import {
  type AnyService,
  type Application,
  type Container,
  Database,
  type Job,
} from '@qovery/domains/services/data-access'
import { useEditService, useServices } from '@qovery/domains/services/feature'
import { buildEditServicePayload } from '@qovery/shared/util-services'
import { PageSettingsPreviewEnvironments } from '../../ui/page-settings-preview-environments/page-settings-preview-environments'

export function SettingsPreviewEnvironmentsFeature({ services }: { services?: AnyService[] }) {
  const { projectId = '', environmentId = '' } = useParams()
  const [loading, setLoading] = useState(false)

  const { isFetched: loadingStatusEnvironmentDeploymentRules, data: environmentDeploymentRules } =
    useFetchEnvironmentDeploymentRule(projectId, environmentId)
  const editEnvironmentDeploymentRule = useEditEnvironmentDeploymentRule(projectId, environmentId)
  const { mutateAsync: editService } = useEditService({ environmentId })

  const methods = useForm({
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit(async (data) => {
    if (data) {
      setLoading(true)
      // update auto preview for environment
      const cloneEnvironmentDeploymentRules = Object.assign({}, environmentDeploymentRules as EnvironmentDeploymentRule)
      cloneEnvironmentDeploymentRules.auto_preview = data['auto_preview']
      cloneEnvironmentDeploymentRules.on_demand_preview = data['on_demand_preview']

      editEnvironmentDeploymentRule.mutate({
        environmentId,
        deploymentRuleId: environmentDeploymentRules?.id || '',
        data: cloneEnvironmentDeploymentRules,
      })

      services?.forEach(async (service: AnyService) => {
        if (service.serviceType === 'DATABASE') return

        if (service.id === Object.keys(data).find((key) => key === service.id)) {
          // const payload = match(service)
          //   .with({ serviceType: 'APPLICATION' }, (s) => ({
          //     ...(s as Application),
          //     serviceType: 'APPLICATION',
          //   }))
          //   .with({ serviceType: 'JOB' }, (s) => ({
          //     ...(s as Job),
          //     serviceType: 'JOB',
          //   }))
          //   .with({ serviceType: 'CONTAINER' }, (s) => ({
          //     ...(s as Container),
          //     serviceType: 'CONTAINER',
          //   }))
          //   .otherwise(() => null)

          const payload = match(service.serviceType)
            .with('APPLICATION', () => ({
              ...service,
              serviceType: 'APPLICATION',
              request: {
                auto_preview: data[service.id],
              },
            }))
            .with('JOB', () => ({
              ...service,
              serviceType: 'JOB',
              request: {
                auto_preview: data[service.id],
              },
            }))
            .with('CONTAINER', () => ({
              ...service,
              serviceType: 'CONTAINER',
              request: {
                auto_preview: data[service.id],
              },
            }))
            .with('HELM', () => ({
              ...service,
              serviceType: 'HELM',
              request: {
                auto_preview: data[service.id],
              },
            }))
            .otherwise(() => null)

          if (!service) return

          await editService({
            serviceId: service.id,
            payload: buildEditServicePayload(payload),
          })
        }
      })

      setLoading(false)
    }
  })

  const toggleAll = (value: boolean) => {
    methods.setValue('on_demand_preview', value)
    //set all preview applications "true" when env preview is true
    if (loadingStatusEnvironmentDeploymentRules) {
      services?.forEach((service) => methods.setValue(service.id, value, { shouldDirty: true }))
    }
  }

  // Force enable Preview if we enable preview from the 1rst application
  const toggleEnablePreview = (value: boolean) => {
    const isApplicationPreviewEnabled = services
      ? services.some((service) => service?.serviceType !== 'DATABASE' && service.auto_preview)
      : false
    if (isApplicationPreviewEnabled || !value) {
      return
    }

    methods.setValue('on_demand_preview', value)
    methods.setValue('auto_preview', value)
  }

  useEffect(() => {
    // !loading is here to prevent the toggle to glitch the time we are submitting the two api endpoints
    if (environmentDeploymentRules && loadingStatusEnvironmentDeploymentRules && !loading) {
      const isApplicationPreviewEnabled = services
        ? services.some((app) => app.serviceType !== 'DATABASE' && app.auto_preview)
        : false
      methods.setValue('auto_preview', environmentDeploymentRules.auto_preview || isApplicationPreviewEnabled)
      methods.setValue('on_demand_preview', environmentDeploymentRules.on_demand_preview)
      services?.forEach((service) =>
        methods.setValue(service.id, service.serviceType !== 'DATABASE' && service.auto_preview)
      )
    }
  }, [loadingStatusEnvironmentDeploymentRules, methods, environmentDeploymentRules, services, loading])

  return (
    <FormProvider {...methods}>
      <PageSettingsPreviewEnvironments
        onSubmit={onSubmit}
        services={services}
        loading={loading}
        toggleAll={toggleAll}
        toggleEnablePreview={toggleEnablePreview}
      />
    </FormProvider>
  )
}

export function PageSettingsPreviewEnvironmentsFeature() {
  const { environmentId = '' } = useParams()
  const { data: services } = useServices({ environmentId })

  return <SettingsPreviewEnvironmentsFeature services={services} />
}

export default PageSettingsPreviewEnvironmentsFeature
