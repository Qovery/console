import { useEffect, useRef } from 'react'
import { type Cluster, type ClusterStatus, ClusterStateEnum } from 'qovery-typescript-axios'
import { useProjects } from '@qovery/domains/projects/feature'
import { CLUSTER_OVERVIEW_URL, CLUSTER_URL, INFRA_LOGS_URL, OVERVIEW_URL } from '@qovery/shared/routes'
import {
  isClusterNotificationEnabled,
  isClusterSoundEnabled,
} from '../../deployment-progress/cluster-notification-permission-modal'
import {
  clearTrackedClusterInstall,
  getTrackedClusterInstallIds,
} from '../../utils/cluster-install-tracking'
import { getCachedDeploymentProgress, type LifecycleState } from '../use-deployment-progress/use-deployment-progress'

type ClusterStatusWithFlag = ClusterStatus

const clusterCompletionSoundUrl = new URL(
  '../../../../../../../shared/ui/src/lib/assets/sound/cluster_completion.mp3',
  import.meta.url
).toString()

const playCompletionSound = () => {
  if (!isClusterSoundEnabled() || typeof Audio === 'undefined') return
  try {
    const audio = new Audio(clusterCompletionSoundUrl)
    audio.volume = 0.6
    void audio.play()
  } catch (error) {
    console.debug('Unable to play cluster completion sound', error)
  }
}

export function useClusterInstallNotifications({
  organizationId,
  clusters = [],
  clusterStatuses = [],
}: {
  organizationId: string
  clusters?: Cluster[]
  clusterStatuses?: ClusterStatusWithFlag[]
}) {
  const notifiedClustersRef = useRef<Set<string>>(new Set())
  const { data: projects = [] } = useProjects({ organizationId, enabled: !!organizationId })
  const trackedIdsRef = useRef<Set<string>>(new Set(getTrackedClusterInstallIds()))
  const prevStateRef = useRef<Map<string, LifecycleState>>(new Map())

  const deriveStateFromStatus = (status?: ClusterStateEnum, is_deployed?: boolean): LifecycleState => {
    if (
      status === ClusterStateEnum.DEPLOYMENT_ERROR ||
      status === ClusterStateEnum.BUILD_ERROR ||
      status === ClusterStateEnum.DELETE_ERROR
    ) {
      return 'failed'
    }
    if (is_deployed || status === ClusterStateEnum.DEPLOYED || status === ClusterStateEnum.READY) return 'succeeded'
    if (
      status === ClusterStateEnum.DEPLOYING ||
      status === ClusterStateEnum.DEPLOYMENT_QUEUED ||
      status === ClusterStateEnum.RESTARTING ||
      status === ClusterStateEnum.RESTART_QUEUED ||
      is_deployed === false
    )
      return 'installing'
    return 'idle'
  }

  useEffect(() => {
    if (!isClusterNotificationEnabled()) return
    if (typeof window === 'undefined') return

    clusterStatuses.forEach((status) => {
      const clusterId = status?.cluster_id
      if (!clusterId || !trackedIdsRef.current.has(clusterId)) return

      const cachedState = getCachedDeploymentProgress(clusterId)?.state
      const derivedState = cachedState ?? deriveStateFromStatus(status?.status, status?.is_deployed)
      const prevState = prevStateRef.current.get(clusterId) ?? 'idle'

      const transitionedToSuccess = prevState !== 'succeeded' && derivedState === 'succeeded'
      const transitionedToFailure = prevState !== 'failed' && derivedState === 'failed'

      if (transitionedToFailure) {
        notifiedClustersRef.current.add(clusterId)
        clearTrackedClusterInstall(clusterId)
        trackedIdsRef.current.delete(clusterId)

        const clusterName = clusters.find((cluster) => cluster.id === clusterId)?.name ?? 'Cluster'

        try {
          const notification = new Notification('Cluster installation failed', {
            body: `${clusterName} installation failed. Check cluster logs for details.`,
            tag: clusterId,
          })

          notification.onclick = (event) => {
            event.preventDefault()
            window.focus()
            window.location.href = INFRA_LOGS_URL(organizationId, clusterId)
          }
        } catch (error) {
          console.error('Unable to show cluster installation failure notification', error)
        }
      } else if (transitionedToSuccess && !notifiedClustersRef.current.has(clusterId)) {
        notifiedClustersRef.current.add(clusterId)
        clearTrackedClusterInstall(clusterId)
        trackedIdsRef.current.delete(clusterId)

        const clusterName = clusters.find((cluster) => cluster.id === clusterId)?.name ?? 'Cluster'
        const firstProject = projects[0]
        const body = firstProject?.name
          ? `${clusterName} is ready. You can deploy your apps now in ${firstProject.name}.`
          : `${clusterName} is ready. You can deploy your apps now.`

        try {
          const notification = new Notification('Cluster installed', {
            body,
            tag: clusterId,
          })

          notification.onclick = (event) => {
            event.preventDefault()
            window.focus()
            if (firstProject?.id) {
              window.location.href = OVERVIEW_URL(organizationId, firstProject.id)
            } else {
              window.location.href = CLUSTER_URL(organizationId, clusterId) + CLUSTER_OVERVIEW_URL
            }
          }
        } catch (error) {
          console.error('Unable to show cluster installation notification', error)
        }

        playCompletionSound()
      }

      prevStateRef.current.set(clusterId, derivedState)
    })
  }, [clusterStatuses, clusters, organizationId, projects])
}

export default useClusterInstallNotifications
