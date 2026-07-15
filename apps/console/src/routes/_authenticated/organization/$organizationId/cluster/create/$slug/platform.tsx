import { Navigate, createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { StepPlatform, useClusterContainerCreateContext } from '@qovery/domains/clusters/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/cluster/create/$slug/platform')({
  component: Platform,
})

function Platform() {
  useDocumentTitle('Platform layers - Create Cluster')
  const { organizationId = '', slug = '' } = useParams({ strict: false })
  const navigate = useNavigate()
  const { isEngineV2SelfManaged } = useClusterContainerCreateContext()
  const creationFlowUrl = `/organization/${organizationId}/cluster/create/${slug}`

  if (!isEngineV2SelfManaged) {
    return (
      <Navigate
        to="/organization/$organizationId/cluster/create/$slug/general"
        params={{ organizationId, slug }}
        replace
      />
    )
  }

  return (
    <StepPlatform
      organizationId={organizationId}
      onPrevious={() => navigate({ to: `${creationFlowUrl}/general` })}
      onSubmit={() => navigate({ to: `${creationFlowUrl}/summary` })}
    />
  )
}
