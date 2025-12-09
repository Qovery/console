import clsx from 'clsx'
import { ClusterStateEnum } from 'qovery-typescript-axios'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  ClusterCardNodeUsage,
  ClusterCardResources,
  ClusterCardSetup,
  ClusterTableNode,
  ClusterTableNodepool,
  useClusterMetrics,
} from '@qovery/domains/cluster-metrics/feature'
import { useCluster, useClusterRunningStatus, useClusterStatus } from '@qovery/domains/clusters/feature'
import { displayClusterDeploymentBanner } from '@qovery/pages/layout'
import { Icon, Tooltip } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { DeploymentOngoingCard } from '../../ui/deployment-ongoing-card/deployment-ongoing-card'
import { TableSkeleton } from './table-skeleton'

function TableLegend() {
  return (
    <div className="flex w-full items-center justify-end gap-1.5 text-xs text-neutral-400">
      <span className="block h-2 w-2 bg-brand-400"></span>
      <span className="flex items-center gap-1">
        Reserved
        <Tooltip content="Reserved CPU or memory represents the amount of resource guaranteed for this workload.">
          <span className="relative top-[1px] text-neutral-350">
            <Icon iconName="circle-question" iconStyle="regular" />
          </span>
        </Tooltip>
      </span>
    </div>
  )
}

export function PageOverviewFeature() {
  useDocumentTitle('Cluster - Overview')
  const { organizationId = '', clusterId = '' } = useParams()
  const { data: cluster, isLoading: isClusterLoading } = useCluster({ organizationId, clusterId })
  const { data: runningStatus } = useClusterRunningStatus({ organizationId, clusterId })
  const { data: clusterMetrics } = useClusterMetrics({ organizationId, clusterId })
  const { data: clusterStatus } = useClusterStatus({ organizationId, clusterId, refetchInterval: 5000 })
  const [showDeploymentCard, setShowDeploymentCard] = useState(false)
  const [renderDeploymentCard, setRenderDeploymentCard] = useState(false)
  const [isDeploymentCardFading, setIsDeploymentCardFading] = useState(false)
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasSeenDeploymentInProgress = useRef(false)

  const isLoading = isClusterLoading || !runningStatus || !clusterMetrics
  const isKarpenter = cluster?.features?.find((feature) => feature.id === 'KARPENTER')
  const isDeploymentInProgress =
    clusterStatus &&
    displayClusterDeploymentBanner(clusterStatus?.status ?? cluster?.status) &&
    !clusterStatus?.is_deployed
  const failureStatuses: ClusterStateEnum[] = [
    ClusterStateEnum.DEPLOYMENT_ERROR,
    ClusterStateEnum.BUILD_ERROR,
    ClusterStateEnum.DELETE_ERROR,
  ]
  const isDeploymentFailed = clusterStatus ? failureStatuses.includes(clusterStatus.status as ClusterStateEnum) : false

  useEffect(() => {
    if (isDeploymentInProgress) {
      hasSeenDeploymentInProgress.current = true
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
        hideTimeoutRef.current = null
      }
      setShowDeploymentCard(true)
      return
    }

    if (hasSeenDeploymentInProgress.current && (clusterStatus?.is_deployed || isDeploymentFailed)) {
      if (!hideTimeoutRef.current) {
        hideTimeoutRef.current = setTimeout(() => {
          setShowDeploymentCard(false)
          hideTimeoutRef.current = null
          hasSeenDeploymentInProgress.current = false
        }, 10000)
      }
      setShowDeploymentCard(true)
      return
    }

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }
    hasSeenDeploymentInProgress.current = false
    setShowDeploymentCard(false)
  }, [clusterStatus?.is_deployed, isDeploymentInProgress])

  useEffect(() => {
    if (showDeploymentCard) {
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current)
        fadeTimeoutRef.current = null
      }
      setIsDeploymentCardFading(false)
      setRenderDeploymentCard(true)
      return
    }

    if (renderDeploymentCard && !fadeTimeoutRef.current) {
      setIsDeploymentCardFading(true)
      fadeTimeoutRef.current = setTimeout(() => {
        setRenderDeploymentCard(false)
        setIsDeploymentCardFading(false)
        fadeTimeoutRef.current = null
      }, 300)
    }
  }, [renderDeploymentCard, showDeploymentCard])

  useEffect(
    () => () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
        hideTimeoutRef.current = null
      }
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current)
        fadeTimeoutRef.current = null
      }
    },
    []
  )

  if (typeof runningStatus === 'string') {
    return (
      <div className="h-80 p-8">
        <div className="flex h-full flex-col items-center justify-center gap-1 rounded border border-neutral-200 bg-neutral-100 py-10 text-sm text-neutral-350">
          <Icon className="text-xl text-neutral-300" iconName="circle-info" iconStyle="regular" />
          <span className="font-medium">No metrics available because the running status is unavailable.</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      {renderDeploymentCard && (
        <div className={clsx(isDeploymentCardFading && 'animate-fadeout')}>
          <DeploymentOngoingCard
            organizationId={organizationId}
            clusterId={clusterId}
            clusterName={cluster?.name}
            cloudProvider={cluster?.cloud_provider}
          />
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-3">
        <ClusterCardNodeUsage organizationId={organizationId} clusterId={clusterId} />
        <ClusterCardResources organizationId={organizationId} clusterId={clusterId} />
        <ClusterCardSetup organizationId={organizationId} clusterId={clusterId} />
      </div>
      {isLoading ? (
        <TableSkeleton />
      ) : isKarpenter ? (
        <div className="flex flex-col gap-4">
          <TableLegend />
          <ClusterTableNodepool organizationId={organizationId} clusterId={clusterId} />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <TableLegend />
          <div className="overflow-hidden rounded border border-neutral-250">
            <ClusterTableNode organizationId={organizationId} clusterId={clusterId} className="border-0" />
          </div>
        </div>
      )}
    </div>
  )
}

export default PageOverviewFeature
