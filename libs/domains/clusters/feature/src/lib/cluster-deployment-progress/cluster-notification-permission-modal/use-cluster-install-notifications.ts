import { type Cluster, ClusterStateEnum, type ClusterStatus } from 'qovery-typescript-axios'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useProjects } from '@qovery/domains/projects/feature'
import { CLUSTER_OVERVIEW_URL, CLUSTER_URL, INFRA_LOGS_URL, OVERVIEW_URL } from '@qovery/shared/routes'
import {
  type LifecycleState,
  getCachedDeploymentProgress,
} from '../../hooks/use-deployment-progress/use-deployment-progress'
import { clearTrackedClusterInstall, getTrackedClusterInstalls } from '../../utils/cluster-install-tracking'
import { isClusterNotificationEnabled, isClusterSoundEnabled } from './cluster-notification-permission-modal'

type ClusterStatusWithFlag = ClusterStatus

const clusterCompletionSoundUrl = '/assets/sound/cluster_completion.mp3'

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
  const [trackedInstalls, setTrackedInstalls] = useState(() =>
    typeof window === 'undefined' ? [] : getTrackedClusterInstalls()
  )
  const trackedIdsRef = useRef<Set<string>>(new Set(trackedInstalls.map(({ id }) => id)))
  const prevStateRef = useRef<Map<string, LifecycleState>>(new Map())

  const trackedNames = useMemo(() => {
    const map = new Map<string, string | undefined>()
    trackedInstalls.forEach(({ id, name }) => map.set(id, name))
    return map
  }, [trackedInstalls])

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

  // Keep tracked IDs fresh in case they change after the hook mounted (e.g. new install starts)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const syncTrackedIds = () => {
      const installs = getTrackedClusterInstalls()
      setTrackedInstalls(installs)
      trackedIdsRef.current = new Set(installs.map(({ id }) => id))
    }

    syncTrackedIds()
    const interval = setInterval(syncTrackedIds, 5_000)
    window.addEventListener('storage', syncTrackedIds)
    window.addEventListener('focus', syncTrackedIds)

    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', syncTrackedIds)
      window.removeEventListener('focus', syncTrackedIds)
    }
  }, [])

  useEffect(() => {
    if (!isClusterNotificationEnabled()) return
    if (typeof window === 'undefined') return
    if (trackedInstalls.length === 0) return

    trackedIdsRef.current = new Set(trackedInstalls.map(({ id }) => id))

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
        setTrackedInstalls((prev) => prev.filter((install) => install.id !== clusterId))

        const clusterName =
          trackedNames.get(clusterId) ?? clusters.find((cluster) => cluster.id === clusterId)?.name ?? 'Cluster'

        try {
          const notification = new Notification(`${clusterName} installation failed`, {
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
        setTrackedInstalls((prev) => prev.filter((install) => install.id !== clusterId))

        const clusterName =
          trackedNames.get(clusterId) ?? clusters.find((cluster) => cluster.id === clusterId)?.name ?? 'Cluster'
        const firstProject = projects[0]
        const body = firstProject?.name
          ? `${clusterName} is ready. You can deploy your apps now in ${firstProject.name}.`
          : `${clusterName} is ready. You can deploy your apps now.`

        try {
          const notification = new Notification(`${clusterName} installed`, {
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
  }, [clusterStatuses, clusters, organizationId, projects, trackedInstalls, trackedNames])
}

export default useClusterInstallNotifications
