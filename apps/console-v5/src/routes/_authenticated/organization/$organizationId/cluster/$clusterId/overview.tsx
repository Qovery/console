import { createFileRoute, useParams } from '@tanstack/react-router'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/cluster/$clusterId/overview')({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId, clusterId } = useParams({ strict: false })
  useDocumentTitle('Cluster - Overview')

  if (!organizationId || !clusterId) {
    return null
  }

  return (
    <div>
      <p>Cluster Overview for {clusterId}</p>
    </div>
  )
}
