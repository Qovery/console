import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { StepKubeconfig } from '@qovery/domains/clusters/feature'
import { type ClusterKubeconfigData } from '@qovery/shared/interfaces'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/cluster/create/$slug/kubeconfig')({
  component: Kubeconfig,
})

function Kubeconfig() {
  useDocumentTitle('Kubeconfig - Create Cluster')
  const { organizationId = '', slug } = useParams({ strict: false })
  const navigate = useNavigate()

  const creationFlowUrl = `/organization/${organizationId}/cluster/create/${slug}`

  const handleSubmit = (_data: ClusterKubeconfigData) => {
    if (slug === 'aws-eks-anywhere') {
      navigate({ to: `${creationFlowUrl}/eks` })
      return
    }

    navigate({ to: `${creationFlowUrl}/summary` })
  }

  return <StepKubeconfig onSubmit={handleSubmit} />
}
