import { createFileRoute } from '@tanstack/react-router'
import { ClusterAdvancedSettingsFeature } from '@qovery/domains/clusters/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/cluster/$clusterId/settings/advanced-settings'
)({
  component: RouteComponent,
})

function RouteComponent() {
  useDocumentTitle('Advanced settings - Cluster settings')

  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="p-8">
        <SettingsHeading
          title="Advanced Settings"
          description="Any change to this section will be applied after triggering a cluster update."
        />
        <ClusterAdvancedSettingsFeature />
      </Section>
    </div>
  )
}
