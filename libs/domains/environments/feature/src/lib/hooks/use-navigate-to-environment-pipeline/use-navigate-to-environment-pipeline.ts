import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from '@qovery/shared/ui'
import { getLatestEnvironmentDeploymentId, isEnvironmentVersionedId } from './get-latest-environment-deployment-id'

interface NavigateToEnvironmentPipelineProps {
  organizationId: string
  projectId: string
  environmentId: string
  deploymentId?: string | null
}

const PIPELINE_LOOKUP_ATTEMPTS = 4
const PIPELINE_LOOKUP_RETRY_DELAY_MS = 500

export function useNavigateToEnvironmentPipeline() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return async ({ organizationId, projectId, environmentId, deploymentId }: NavigateToEnvironmentPipelineProps) => {
    const waitForHistoryToCatchUp = isEnvironmentVersionedId(deploymentId)
    let resolvedDeploymentId: string | undefined

    for (let attempt = 0; attempt < PIPELINE_LOOKUP_ATTEMPTS; attempt++) {
      resolvedDeploymentId = await getLatestEnvironmentDeploymentId(queryClient, environmentId, deploymentId)
      if (resolvedDeploymentId && !waitForHistoryToCatchUp) break

      if (attempt < PIPELINE_LOOKUP_ATTEMPTS - 1) {
        await new Promise((resolve) => setTimeout(resolve, PIPELINE_LOOKUP_RETRY_DELAY_MS))
      }
    }

    if (!resolvedDeploymentId) {
      toast('warning', 'Pipeline is not available yet', 'Try again in a moment.')
      return
    }

    await navigate({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/deployment/$deploymentId',
      params: { organizationId, projectId, environmentId, deploymentId: resolvedDeploymentId },
    })
  }
}
