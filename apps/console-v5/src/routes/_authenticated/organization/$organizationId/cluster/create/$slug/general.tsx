import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { match } from 'ts-pattern'
import { StepGeneral } from '@qovery/domains/clusters/feature'
import { type ClusterGeneralData } from '@qovery/shared/interfaces'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/cluster/create/$slug/general')({
  component: General,
})

function General() {
  useDocumentTitle('General - Create Cluster')
  const { organizationId = '', slug } = useParams({ strict: false })
  const navigate = useNavigate()

  const creationFlowUrl = `/organization/${organizationId}/cluster/create/${slug}`

  const handleSubmit = (data: ClusterGeneralData) => {
    match(data)
      .with({ installation_type: 'SELF_MANAGED' }, () => navigate({ to: `${creationFlowUrl}/kubeconfig` }))
      .with({ installation_type: 'MANAGED', cloud_provider: 'GCP' }, () =>
        navigate({ to: `${creationFlowUrl}/features` })
      )
      .with({ installation_type: 'PARTIALLY_MANAGED' }, () => navigate({ to: `${creationFlowUrl}/kubeconfig` }))
      .otherwise(() => navigate({ to: `${creationFlowUrl}/resources` }))
  }

  return <StepGeneral organizationId={organizationId} onSubmit={handleSubmit} />
}
