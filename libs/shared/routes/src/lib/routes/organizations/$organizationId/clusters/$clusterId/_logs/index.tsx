import { createFileRoute } from '@tanstack/react-router'
import { PageInfraLogs } from '@qovery/pages/logs/infra'
import { queries } from '@qovery/state/util-queries'

export const Route = createFileRoute('/organizations/$organizationId/clusters/$clusterId/_logs/')({
  loader: async ({ context: { queryClient }, params: { organizationId, clusterId } }) => {
    const clusters = await queryClient.ensureQueryData({ ...queries.clusters.list({ organizationId }) })
    const cluster = (clusters ?? []).find(({ id }) => id === clusterId)
    if (!cluster) {
      throw Error('Unknown cluster')
    }
    return cluster
  },
  component: PageInfraLogs,
})
