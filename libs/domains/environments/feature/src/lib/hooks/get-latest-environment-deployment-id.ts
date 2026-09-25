import { type QueryClient } from '@tanstack/react-query'
import { queries } from '@qovery/state/util-queries'

function normalizeEnvironmentDeploymentId(deploymentId?: string | null) {
  if (!deploymentId) return undefined

  // Environment mutation responses can contain a VersionedId for the environment itself,
  // which is not the execution ID expected by the pipeline route.
  if (/^VersionedId\(id=.+, version=\d+\)$/.test(deploymentId)) return undefined

  return deploymentId
}

export async function getLatestEnvironmentDeploymentId(
  queryClient: QueryClient,
  environmentId: string,
  deploymentId?: string | null
) {
  try {
    const deployments = await queryClient.fetchQuery({
      ...queries.environments.deploymentHistoryV2({ environmentId, pageSize: 100 }),
      staleTime: 0,
    })

    const latestDeploymentId = [...deployments].sort(
      (a, b) => new Date(b.auditing_data.created_at).getTime() - new Date(a.auditing_data.created_at).getTime()
    )[0]?.identifier.execution_id

    if (latestDeploymentId) return normalizeEnvironmentDeploymentId(latestDeploymentId)
  } catch {
    // Use the mutation response if deployment history is temporarily unavailable.
  }

  return normalizeEnvironmentDeploymentId(deploymentId)
}
