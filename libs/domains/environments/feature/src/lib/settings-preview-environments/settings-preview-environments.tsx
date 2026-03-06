import { useParams } from '@tanstack/react-router'
import { type EnvironmentDeploymentRule } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form'
import { match } from 'ts-pattern'
import { type AnyService } from '@qovery/domains/services/data-access'
import { useEditService, useServices } from '@qovery/domains/services/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { IconEnum } from '@qovery/shared/enums'
import { BlockContent, Button, Icon, InputToggle, Section } from '@qovery/shared/ui'
import { buildEditServicePayload } from '@qovery/shared/util-services'
import { useDeploymentRule } from '../hooks/use-deployment-rule/use-deployment-rule'
import { useEditDeploymentRule } from '../hooks/use-edit-deployment-rule/use-edit-deployment-rule'

interface PageSettingsPreviewEnvironmentsProps {
  onSubmit: () => void
  services?: AnyService[]
  loading: boolean
  toggleAll: (value: boolean) => void
  toggleEnablePreview: (value: boolean) => void
}

export function PageSettingsPreviewEnvironments(props: PageSettingsPreviewEnvironmentsProps) {
  const { onSubmit, services, loading, toggleAll, toggleEnablePreview } = props
  const { control, formState } = useFormContext()

  const getIconName = (service: AnyService) =>
    match(service)
      .with({ serviceType: 'JOB', job_type: 'CRON' }, () => IconEnum.CRON_JOB)
      .with({ serviceType: 'JOB', job_type: 'LIFECYCLE' }, () => IconEnum.LIFECYCLE_JOB)
      .with({ serviceType: 'HELM' }, () => IconEnum.HELM)
      .otherwise(() => IconEnum.APPLICATION)

  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="max-w-content-with-navigation-left p-8">
        <SettingsHeading title="Preview environments" />
        <form onSubmit={onSubmit}>
          <BlockContent title="Global settings">
            <Controller
              name="auto_preview"
              control={control}
              render={({ field }) => (
                <InputToggle
                  dataTestId="toggle-all"
                  className="mb-5"
                  value={field.value}
                  onChange={(value) => {
                    toggleAll(value)
                    field.onChange(value)
                  }}
                  title="Turn on Preview Environments"
                  description="Use this environment as Blueprint to create a preview environment when a Pull Request is submitted on one of your services. The environment will be automatically deleted when the PR is merged."
                  forceAlignTop
                  small
                />
              )}
            />
            <Controller
              name="on_demand_preview"
              control={control}
              render={({ field }) => (
                <InputToggle
                  dataTestId="toggle-on-demand-preview"
                  className="mb-5"
                  value={field.value}
                  onChange={field.onChange}
                  title="Create on demand"
                  description="Trigger the creation of the preview environment only when requested within the Pull Request. Disabling this option will create a preview environment for each Pull Request."
                  forceAlignTop
                  small
                />
              )}
            />
            <div data-testid="toggles" className={services && services.length > 0 ? 'mt-5' : ''}>
              {services && services.length > 0 && (
                <h2 data-testid="services-title" className="mb-5 text-ssm font-medium text-neutral">
                  Create Preview for PR opened on those services
                </h2>
              )}
              {services?.map(
                (service: AnyService) =>
                  service.serviceType !== 'DATABASE' && (
                    <div key={service.id} className="flex h-9 items-center">
                      <Controller
                        name={service.id}
                        control={control}
                        render={({ field }) => (
                          <InputToggle
                            dataTestId={`toggle-${service.id}`}
                            value={field.value}
                            onChange={(value) => {
                              toggleEnablePreview(value)
                              field.onChange(value)
                            }}
                            title={
                              <span className="relative -top-1 flex items-center">
                                <Icon name={getIconName(service)} className="mr-3" />
                                {service.name}
                              </span>
                            }
                            small
                          />
                        )}
                      />
                    </div>
                  )
              )}
            </div>
          </BlockContent>
          <div className="flex justify-end">
            <Button className="mb-6" disabled={!formState.isValid} size="lg" loading={loading} type="submit">
              Save
            </Button>
          </div>
        </form>
      </Section>
    </div>
  )
}

export function SettingsPreviewEnvironmentsFeature({ services }: { services: AnyService[] }) {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  const [loading, setLoading] = useState(false)

  const { isFetched: loadingStatusEnvironmentDeploymentRules, data: environmentDeploymentRules } = useDeploymentRule({
    environmentId,
  })
  const { mutateAsync: editEnvironmentDeploymentRule } = useEditDeploymentRule()
  const { mutateAsync: editService } = useEditService({ organizationId, projectId, environmentId, silently: true })

  const methods = useForm({
    mode: 'onChange',
  })

  const onSubmit = methods.handleSubmit(async (data) => {
    if (!data) return
    setLoading(true)
    try {
      // update auto preview for environment
      const cloneEnvironmentDeploymentRules = Object.assign({}, environmentDeploymentRules as EnvironmentDeploymentRule)
      cloneEnvironmentDeploymentRules.auto_preview = data['auto_preview']
      cloneEnvironmentDeploymentRules.on_demand_preview = data['on_demand_preview']

      await editEnvironmentDeploymentRule({
        environmentId,
        deploymentRuleId: environmentDeploymentRules?.id || '',
        payload: cloneEnvironmentDeploymentRules,
      })

      const updatePromises = services
        .filter(
          (service): service is Exclude<AnyService, { serviceType: 'DATABASE' }> => service.serviceType !== 'DATABASE'
        )
        .map(async (service) => {
          const request = {
            auto_preview: data[service.id],
          }

          const payload = match(service)
            .with({ serviceType: 'APPLICATION' }, (s) => buildEditServicePayload({ service: s, request }))
            .with({ serviceType: 'CONTAINER' }, (s) => buildEditServicePayload({ service: s, request }))
            .with({ serviceType: 'JOB' }, (s) => buildEditServicePayload({ service: s, request }))
            .with({ serviceType: 'HELM' }, (s) => buildEditServicePayload({ service: s, request }))
            .with({ serviceType: 'TERRAFORM' }, (s) => buildEditServicePayload({ service: s }))
            .exhaustive()

          try {
            await editService({
              serviceId: service.id,
              payload,
            })
          } catch (error) {
            console.error(error)
          }
        })

      await Promise.all(updatePromises)
    } finally {
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
      ? services.some((service) => 'auto_preview' in service && service.auto_preview)
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
        ? services.some((app) => 'auto_preview' in app && app.auto_preview)
        : false
      const nextValues: Record<string, boolean> = {
        auto_preview: environmentDeploymentRules.auto_preview || isApplicationPreviewEnabled,
        on_demand_preview: environmentDeploymentRules.on_demand_preview ?? false,
      }
      services.forEach((service) => {
        nextValues[service.id] = ('auto_preview' in service && service.auto_preview) ?? false
      })
      methods.reset(nextValues, { keepDirtyValues: true })
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
  const { environmentId = '' } = useParams({ strict: false })
  const { data: services } = useServices({ environmentId })

  return <SettingsPreviewEnvironmentsFeature services={services} />
}
