import { ClusterStateEnum, type ClusterStatus } from 'qovery-typescript-axios'
import { useEffect, useMemo, useRef, useState } from 'react'

interface UseActiveDeploymentClustersProps {
  clusterStatuses?: ClusterStatus[]
  trackedClusterIds?: string[]
  gracePeriodMs?: number
}

const isDeploying = ({ status, is_deployed }: { status?: ClusterStateEnum; is_deployed?: boolean }) =>
  (status === ClusterStateEnum.DEPLOYMENT_QUEUED || status === ClusterStateEnum.DEPLOYING) &&
  (is_deployed === false || is_deployed === undefined)

const isTerminal = ({ status, is_deployed }: { status?: ClusterStateEnum; is_deployed?: boolean }) =>
  is_deployed === true ||
  status === ClusterStateEnum.DEPLOYED ||
  status === ClusterStateEnum.READY ||
  status === ClusterStateEnum.DEPLOYMENT_ERROR ||
  status === ClusterStateEnum.BUILD_ERROR ||
  status === ClusterStateEnum.DELETE_ERROR

export function useActiveDeploymentClusters({
  clusterStatuses,
  trackedClusterIds,
  gracePeriodMs = 10000,
}: UseActiveDeploymentClustersProps) {
  const [activeIds, setActiveIds] = useState<string[]>([])
  const removalTimersRef = useRef<Record<string, number>>({})
  const dismissedIdsRef = useRef<Set<string>>(new Set())

  const allowedIds = useMemo(() => new Set(trackedClusterIds), [trackedClusterIds])

  useEffect(() => {
    if (!clusterStatuses) return

    // Clear dismissal when a new deployment starts
    clusterStatuses.forEach(({ cluster_id, status, is_deployed }) => {
      if (!cluster_id) return
      if (isDeploying({ status, is_deployed })) {
        dismissedIdsRef.current.delete(cluster_id)
      }
    })

    const idsToAdd =
      clusterStatuses
        .filter(
          ({ status, is_deployed }) => isDeploying({ status, is_deployed }) || isTerminal({ status, is_deployed })
        )
        .map(({ cluster_id }) => cluster_id ?? '')
        .filter((id): id is string => Boolean(id)) || []

    if (idsToAdd.length) {
      setActiveIds((prev) => {
        const next = new Set(prev)
        idsToAdd.forEach((id) => {
          if (!dismissedIdsRef.current.has(id) && (!allowedIds.size || allowedIds.has(id))) {
            next.add(id)
          }
        })
        return Array.from(next)
      })
    }
  }, [clusterStatuses, allowedIds])

  useEffect(() => {
    if (!clusterStatuses || activeIds.length === 0) return

    clusterStatuses.forEach(({ cluster_id, status, is_deployed }) => {
      if (!cluster_id || !activeIds.includes(cluster_id)) return
      const terminal = isTerminal({ status, is_deployed })
      const alreadyScheduled = removalTimersRef.current[cluster_id]

      if (terminal && !alreadyScheduled) {
        const timer = window.setTimeout(() => {
          setActiveIds((prev) => prev.filter((id) => id !== cluster_id))
          delete removalTimersRef.current[cluster_id]
          dismissedIdsRef.current.add(cluster_id)
        }, gracePeriodMs)
        removalTimersRef.current[cluster_id] = timer
      }
    })

    Object.entries(removalTimersRef.current).forEach(([clusterId, timer]) => {
      if (!activeIds.includes(clusterId)) {
        clearTimeout(timer)
        delete removalTimersRef.current[clusterId]
      }
    })
  }, [clusterStatuses, activeIds, gracePeriodMs])

  useEffect(
    () => () => {
      Object.values(removalTimersRef.current).forEach((timer) => clearTimeout(timer))
      removalTimersRef.current = {}
    },
    []
  )

  return { activeIds }
}

export default useActiveDeploymentClusters
