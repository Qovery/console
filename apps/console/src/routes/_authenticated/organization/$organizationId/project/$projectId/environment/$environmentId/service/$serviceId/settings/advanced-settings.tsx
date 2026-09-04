import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import { AgenticWorkflowSettings } from '@qovery/domains/service-settings/feature'
import { isAgenticWorkflow } from '@qovery/domains/services/data-access'
import { ServiceAdvancedSettings, ServiceAdvancedSettingsLoader, useService } from '@qovery/domains/services/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings/advanced-settings'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { environmentId, serviceId } = Route.useParams()
  const { data: service } = useService({ environmentId, serviceId, suspense: true })
  useDocumentTitle('Advanced settings - Service settings')

  if (service && isAgenticWorkflow(service)) {
    return <AgenticWorkflowSettings page="advanced-settings" />
  }

  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="px-8 pb-8 pt-6">
        <SettingsHeading
          title="Advanced settings"
          description="Any change to this section will be applied after triggering a service update."
        />
        <Suspense fallback={<ServiceAdvancedSettingsLoader />}>
          <ServiceAdvancedSettings />
        </Suspense>
      </Section>
    </div>
  )
}
