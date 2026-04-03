import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import { ServiceAdvancedSettings, ServiceAdvancedSettingsLoader } from '@qovery/domains/services/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings/advanced-settings'
)({
  component: RouteComponent,
})

function RouteComponent() {
  useDocumentTitle('Advanced settings - Service settings')

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
