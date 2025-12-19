import { createFileRoute, useParams } from '@tanstack/react-router'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/cluster/$clusterId/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId, clusterId } = useParams({ strict: false })
  useDocumentTitle('Cluster - Settings')

  if (!organizationId || !clusterId) {
    return null
  }

  return (
    <div>
      <p>Cluster Settings for {clusterId}</p>
    </div>
  )
}
