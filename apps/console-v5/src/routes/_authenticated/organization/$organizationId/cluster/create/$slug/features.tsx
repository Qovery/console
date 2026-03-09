import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { StepFeatures, useClusterContainerCreateContext } from '@qovery/domains/clusters/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/cluster/create/$slug/features')({
  component: Features,
})

function Features() {
  useDocumentTitle('Features - Create Cluster')
  const { organizationId = '', slug } = useParams({ strict: false })
  const navigate = useNavigate()
  const { generalData } = useClusterContainerCreateContext()

  const creationFlowUrl = `/organization/${organizationId}/cluster/create/${slug}`

  const handleSubmit = () => {
    if (generalData?.cloud_provider === 'AWS' || generalData?.cloud_provider === 'GCP') {
      navigate({ to: `${creationFlowUrl}/addons` })
      return
    }
    navigate({ to: `${creationFlowUrl}/summary` })
  }

  return <StepFeatures organizationId={organizationId} onSubmit={handleSubmit} />
}
