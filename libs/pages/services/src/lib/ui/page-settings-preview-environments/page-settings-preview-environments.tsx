import { Controller, useFormContext } from 'react-hook-form'
import { match } from 'ts-pattern'
import { type AnyService } from '@qovery/domains/services/data-access'
import { IconEnum } from '@qovery/shared/enums'
import { BlockContent, Button, Heading, Icon, InputToggle, Section } from '@qovery/shared/ui'

export interface PageSettingsPreviewEnvironmentsProps {
  onSubmit: () => void
  loading: boolean
  services: AnyService[]
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
    <div className="flex flex-col justify-between w-full">
      <Section className="p-8 max-w-content-with-navigation-left">
        <div className="flex justify-between mb-8">
          <Heading className="mb-2">Preview environments</Heading>
        </div>
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
            <div data-testid="toggles" className={services.length > 0 ? 'mt-5' : ''}>
              {services.length > 0 && (
                <h2 data-testid="services-title" className="font-medium text-neutral-400 text-ssm mb-5">
                  Create Preview for PR opened on those services
                </h2>
              )}
              {services.map(
                (service: AnyService) =>
                  service.serviceType !== 'DATABASE' && (
                    <div key={service.id} className="h-9 flex items-center">
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
                              <span className="flex items-center -top-1 relative">
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

export default PageSettingsPreviewEnvironments
