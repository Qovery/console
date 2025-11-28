import { useEffect, useMemo, useRef } from 'react'
import { type Cluster, type ClusterStatus, ClusterStateEnum } from 'qovery-typescript-axios'
import { useProjects } from '@qovery/domains/projects/feature'
import { CLUSTER_OVERVIEW_URL, CLUSTER_URL, OVERVIEW_URL } from '@qovery/shared/routes'
import {
  isClusterNotificationEnabled,
  isClusterSoundEnabled,
} from '../../deployment-progress/cluster-notification-permission-modal'
import {
  clearTrackedClusterInstall,
  getTrackedClusterInstallIds,
} from '../../utils/cluster-install-tracking'

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
  const cycleRef = useRef<Map<string, { installing: boolean; notified: boolean }>>(new Map())
  const trackedIdsRef = useRef<Set<string>>(new Set(getTrackedClusterInstallIds()))

  const isInstallingStatus = (status?: ClusterStateEnum) =>
    status === ClusterStateEnum.DEPLOYING ||
    status === ClusterStateEnum.DEPLOYMENT_QUEUED ||
    status === ClusterStateEnum.RESTARTING ||
    status === ClusterStateEnum.RESTART_QUEUED

  const isInstalledStatus = (status?: ClusterStateEnum) =>
    status === ClusterStateEnum.DEPLOYED || status === ClusterStateEnum.READY

  const shouldTrackStatuses = useMemo(
    () => clusterStatuses.some((status) => isInstallingStatus(status?.status) || status?.is_deployed === false),
    [clusterStatuses]
  )

  useEffect(() => {
    if (!isClusterNotificationEnabled() || !shouldTrackStatuses) return
    if (typeof window === 'undefined') return

    clusterStatuses.forEach((status) => {
      const clusterId = status?.cluster_id
      if (!clusterId) return
      if (!trackedIdsRef.current.has(clusterId)) return

      const state = cycleRef.current.get(clusterId) ?? { installing: false, notified: false }
      const nowInstalled = status?.is_deployed === true || isInstalledStatus(status?.status)
      const nowInstalling = isInstallingStatus(status?.status) || status?.is_deployed === false

      // Entering an install/restart cycle
      if (nowInstalling) {
        cycleRef.current.set(clusterId, { installing: true, notified: false })
        notifiedClustersRef.current.delete(clusterId)
        return
      }

      // Notify when a cycle completes
      if (!nowInstalled || !state.installing || state.notified || notifiedClustersRef.current.has(clusterId)) {
        cycleRef.current.set(clusterId, state)
        return
      }

      cycleRef.current.set(clusterId, { installing: false, notified: true })

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
    })
  }, [clusterStatuses, clusters, organizationId, projects, shouldTrackStatuses])
}

export default useClusterInstallNotifications
