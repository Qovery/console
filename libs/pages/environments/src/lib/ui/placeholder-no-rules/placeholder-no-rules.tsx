import { useNavigate } from 'react-router-dom'
import { CLUSTERS_CREATION_GENERAL_URL, CLUSTERS_CREATION_URL, CLUSTERS_URL } from '@qovery/shared/routes'
import { Button, EmptyState } from '@qovery/shared/ui'

export interface PlaceholderNoRulesProps {
  organizationId: string
  linkNewRule: string
  clusterAvailable: boolean
}

export function PlaceholderNoRules({ clusterAvailable, linkNewRule, organizationId }: PlaceholderNoRulesProps) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-grow overflow-y-auto">
      <div className="flex flex-grow items-center justify-center">
        <EmptyState
          title={`${clusterAvailable ? 'Create your first Deployment Rules 🕹' : 'Create your Cluster first 💫'}`}
          description={
            clusterAvailable
              ? undefined
              : 'Deploying a cluster is necessary to start using Qovery and create your first Deployment Rules'
          }
        >
          <Button
            className="mt-5"
            size="lg"
            onClick={() =>
              clusterAvailable
                ? navigate(linkNewRule)
                : navigate(CLUSTERS_URL(organizationId) + CLUSTERS_CREATION_URL + CLUSTERS_CREATION_GENERAL_URL)
            }
          >
            {clusterAvailable ? 'Create Deployment Rule' : 'Create a Cluster'}
          </Button>
        </EmptyState>
      </div>
    </div>
  )
}

export default PlaceholderNoRules
