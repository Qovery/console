import { useNavigate } from 'react-router-dom'
import { CLUSTERS_NEW_URL, CLUSTERS_URL } from '@qovery/shared/routes'
import { Button, EmptyState, Icon } from '@qovery/shared/ui'

export interface PlaceholderNoRulesProps {
  organizationId: string
  linkNewRule: string
  clusterAvailable: boolean
}

export function PlaceholderNoRules({ clusterAvailable, linkNewRule, organizationId }: PlaceholderNoRulesProps) {
  const navigate = useNavigate()

  return (
    <EmptyState
      title={`${clusterAvailable ? 'Create your first Deployment Rules 🕹' : 'Create your Cluster first 💫'}`}
      description={
        clusterAvailable
          ? undefined
          : 'Deploying a cluster is necessary to start using Qovery and create your first Deployment Rules'
      }
    >
      <Button
        className="mt-5 gap-2"
        size="lg"
        onClick={() =>
          clusterAvailable ? navigate(linkNewRule) : navigate(CLUSTERS_URL(organizationId) + CLUSTERS_NEW_URL)
        }
      >
        {clusterAvailable ? 'Create Deployment Rule' : 'Create a Cluster'}
        <Icon iconName="circle-plus" iconStyle="regular" />
      </Button>
    </EmptyState>
  )
}

export default PlaceholderNoRules
