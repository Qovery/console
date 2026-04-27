import { createFileRoute, useParams } from '@tanstack/react-router'
import { ClusterNetworkSettings } from '@qovery/domains/clusters/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Section } from '@qovery/shared/ui'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/cluster/$clusterId/settings/network'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId = '', clusterId = '' } = useParams({ strict: false })

  return (
    <div className="flex w-full flex-col justify-between">
      <Section className="p-8">
        <SettingsHeading
          title="Network configuration"
          description="The Network tab in your cluster settings allows you to view your VPC configuration. You can also update the Qovery VPC route table from this interface to set up VPC peering."
        />
        <div className="max-w-content-with-navigation-left">
          <ClusterNetworkSettings organizationId={organizationId} clusterId={clusterId} />
        </div>
      </Section>
    </div>
  )
}
