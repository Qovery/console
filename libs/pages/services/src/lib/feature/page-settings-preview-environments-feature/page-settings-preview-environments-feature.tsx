import { type EnvironmentDeploymentRule } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useDeploymentRule, useEditDeploymentRule } from '@qovery/domains/environments/feature'
import { type AnyService } from '@qovery/domains/services/data-access'
import { useEditService, useServices } from '@qovery/domains/services/feature'
import { buildEditServicePayload } from '@qovery/shared/util-services'
import { PageSettingsPreviewEnvironments } from '../../ui/page-settings-preview-environments/page-settings-preview-environments'

export function SettingsPreviewEnvironmentsFeature({ services }: { services: AnyService[] }) {
  const { environmentId = '' } = useParams()
  const [loading, setLoading] = useState(false)

  const { isFetched: loadingStatusEnvironmentDeploymentRules, data: environmentDeploymentRules } = useDeploymentRule({
    environmentId,
  })
  const { mutate: editEnvironmentDeploymentRule } = useEditDeploymentRule()
  const { mutateAsync: editService } = useEditService({ environmentId, silently: true })

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

      editEnvironmentDeploymentRule({
        environmentId,
        deploymentRuleId: environmentDeploymentRules?.id || '',
        payload: cloneEnvironmentDeploymentRules,
      })

      services.forEach(async (service: AnyService) => {
        if (service.serviceType === 'DATABASE') return

        if (service.id === Object.keys(data).find((key) => key === service.id)) {
          const request = {
            auto_preview: data[service.id],
          }

          const payload = match(service)
            .with({ serviceType: 'APPLICATION' }, (s) => buildEditServicePayload({ service: s, request }))
            .with({ serviceType: 'CONTAINER' }, (s) => buildEditServicePayload({ service: s, request }))
            .with({ serviceType: 'JOB' }, (s) => buildEditServicePayload({ service: s, request }))
            .with({ serviceType: 'HELM' }, (s) => buildEditServicePayload({ service: s, request }))
            .exhaustive()

          try {
            await editService({
              serviceId: service.id,
              payload,
            })
          } catch (error) {
            console.error(error)
          }
        }
      })

      setLoading(false)
    }
  })

  const toggleAll = (value: boolean) => {
    methods.setValue('on_demand_preview', value)
    //set all preview applications "true" when env preview is true
    if (loadingStatusEnvironmentDeploymentRules) {
      services.forEach((service) => methods.setValue(service.id, value, { shouldDirty: true }))
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
      services.forEach((service) =>
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
