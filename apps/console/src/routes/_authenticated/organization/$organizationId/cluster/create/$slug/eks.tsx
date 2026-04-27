import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { StepEks } from '@qovery/domains/clusters/feature'
import { GitRepositorySettings } from '@qovery/domains/organizations/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/cluster/create/$slug/eks')({
  component: Eks,
})

function Eks() {
  useDocumentTitle('EKS configuration - Create Cluster')
  const { organizationId = '', slug } = useParams({ strict: false })
  const navigate = useNavigate()

  const creationFlowUrl = `/organization/${organizationId}/cluster/create/${slug}`

  return (
    <StepEks
      gitSettings={
        <GitRepositorySettings
          gitDisabled={false}
          showAuthProviders={false}
          organizationId={organizationId}
          rootPathLabel="YAML file path"
          rootPathHint="Provide the path to the EKS Anywhere cluster YAML file in the repository."
        />
      }
      onSubmit={() => navigate({ to: `${creationFlowUrl}/summary` })}
    />
  )
}
