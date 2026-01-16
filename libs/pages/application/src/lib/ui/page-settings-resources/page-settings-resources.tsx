import { type FormEventHandler } from 'react'
import { useFormContext } from 'react-hook-form'
import { match } from 'ts-pattern'
import { type AnyService, type Database, type Helm } from '@qovery/domains/services/data-access'
import { ApplicationSettingsResources, SettingsHeading } from '@qovery/shared/console-shared'
import { Button, Section } from '@qovery/shared/ui'

export interface PageSettingsResourcesProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  displayWarningCpu: boolean
  service: Exclude<AnyService, Helm | Database>
  loading: boolean
}

export function PageSettingsResources(props: PageSettingsResourcesProps) {
  const { onSubmit, loading, service, displayWarningCpu } = props
  const { formState, watch } = useFormContext()

  const autoscalingMode = watch('autoscaling_mode') || 'NONE'

  // Determine the current saved autoscaling mode (not the form value)
  const currentAutoscalingMode = match(service)
    .with({ serviceType: 'APPLICATION' }, { serviceType: 'CONTAINER' }, (s) => {
      if (s.autoscaling?.mode === 'KEDA') return 'KEDA'
      if (s.min_running_instances === s.max_running_instances) return 'NONE'
      if (s.min_running_instances !== s.max_running_instances) return 'HPA'
      return 'NONE'
    })
    .otherwise(() => 'NONE')

  // Disable save if trying to migrate from HPA to KEDA
  const isHpaToKedaMigration = currentAutoscalingMode === 'HPA' && autoscalingMode === 'KEDA'

  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="max-w-content-with-navigation-left p-8">
        <SettingsHeading title="Resources" description="Manage the resources assigned to the service." />
        <form className="space-y-10" onSubmit={onSubmit}>
          <ApplicationSettingsResources displayWarningCpu={displayWarningCpu} service={service} />
          <div className="flex justify-end">
            <Button type="submit" size="lg" loading={loading} disabled={!formState.isValid || isHpaToKedaMigration}>
              Save
            </Button>
          </div>
        </form>
      </Section>
    </div>
  )
}

export default PageSettingsResources
