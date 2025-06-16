import * as Collapsible from '@radix-ui/react-collapsible'
import * as Dialog from '@radix-ui/react-dialog'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { type ClusterNodeDto, type NodePodInfoDto } from 'qovery-ws-typescript-axios'
import { type PropsWithChildren, memo, useMemo, useState } from 'react'
import { useClusterRunningStatus } from '@qovery/domains/clusters/feature'
import {
  APPLICATION_URL,
  CLUSTER_SETTINGS_RESOURCES_URL,
  CLUSTER_SETTINGS_URL,
  CLUSTER_URL,
  ENVIRONMENTS_URL,
  SERVICES_URL,
} from '@qovery/shared/routes'
import { Badge, Button, Heading, Icon, Link, ProgressBar, Section, StatusChip, Tooltip } from '@qovery/shared/ui'
import { timeAgo } from '@qovery/shared/util-dates'
import {
  calculatePercentage,
  formatNumber,
  mibToGib,
  milliCoreToVCPU,
  pluralize,
  twMerge,
  upperCaseFirstLetter,
} from '@qovery/shared/util-js'
import { ClusterProgressBarNode } from '../cluster-progress-bar-node/cluster-progress-bar-node'

export interface ClusterNodeRightPanelProps extends PropsWithChildren {
  organizationId: string
  clusterId: string
  node: ClusterNodeDto
  className?: string
}

const KEY_KARPENTER_CAPACITY_TYPE = 'karpenter.sh/capacity-type'

interface MetricProgressBarProps {
  type: 'cpu' | 'memory'
  used: number
  reserved: number
  total: number
  percentage: number
  unit: string
  isPressure?: boolean
}

function MetricProgressBar({
  type,
  used,
  reserved,
  total,
  percentage,
  unit,
  isPressure = false,
}: MetricProgressBarProps) {
  // const isWarning = percentage > 80

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-ssm text-neutral-350">{type === 'cpu' ? 'CPU' : 'Memory'}</span>
      <span
        className={clsx('mb-1.5 font-semibold text-neutral-400', {
          'text-yellow-900': isPressure,
        })}
      >
        {percentage}%
      </span>
      <ClusterProgressBarNode used={used} reserved={reserved} total={total} />
      <div className="mt-1.5 flex gap-6 text-xs text-neutral-400">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 bg-brand-400"></span>
          Reserved:{' '}
          <span>
            {used} {unit}{' '}
            {/* {isWarning && (
              <Tooltip content="Exceeds reserved allocation. Review workload distribution on high-usage">
                <span>
                  <Icon iconName="circle-exclamation" iconStyle="regular" className="text-xs" />
                </span>
              </Tooltip>
            )} */}
          </span>
        </div>
        {/* <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 bg-brand-400"></span>
          Used:{' '}
          <span
            className={isWarning ? 'inline-flex items-center gap-1 rounded-sm bg-yellow-50 px-0.5 text-yellow-900' : ''}
          >
            {used} {unit}{' '}
            {isWarning && (
              <Tooltip content="Exceeds reserved allocation. Review workload distribution on high-usage">
                <span>
                  <Icon iconName="circle-exclamation" iconStyle="regular" className="text-xs" />
                </span>
              </Tooltip>
            )}
          </span>
        </div> */}
        {/* <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 border border-purple-500 bg-purple-200"></span>
          Reserved: {used} {unit}
        </div> */}
      </div>
    </div>
  )
}

interface NodeProgressBarProps {
  type: 'cpu' | 'memory' | 'disk'
  // used: number
  total: number
  unit: string
}

function NodeProgressBar({ type, unit, total }: NodeProgressBarProps) {
  // const usedPercentage = calculatePercentage(used, total)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex w-full justify-between text-neutral-400">
        <span>{type === 'cpu' ? 'CPU' : upperCaseFirstLetter(type)}</span>
        <span>
          {total} {unit}
        </span>
        {/* <span>
          {used} {unit}
          <span className="text-neutral-350">/{total}</span>
        </span> */}
      </div>
      {/* <ProgressBar.Root>
        <ProgressBar.Cell value={usedPercentage} color="var(--color-brand-400)" />
      </ProgressBar.Root> */}
    </div>
  )
}

interface PodItemProps {
  pod: NodePodInfoDto
  organizationId: string
}

function PodItem({ pod, organizationId }: PodItemProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-neutral-250 px-5 py-4 text-xs last:border-b-0">
      <div className="flex items-start justify-between">
        <span className="flex flex-col gap-2 text-ssm text-neutral-400">
          <span className="flex items-center gap-2 font-medium">
            <StatusChip status={pod.status_phase} />
            {pod.name}
          </span>
          {pod.qovery_service_info?.project_name && (
            <span className="flex gap-0.5 text-neutral-300">
              {pod.qovery_service_info?.project_name && (
                <Link
                  color="brand"
                  className="font-normal"
                  to={ENVIRONMENTS_URL(organizationId, pod.qovery_service_info?.project_id)}
                >
                  {pod.qovery_service_info?.project_name}
                </Link>
              )}
              {pod.qovery_service_info?.project_name && pod.qovery_service_info?.environment_name && (
                <>
                  /
                  <Link
                    color="brand"
                    className="font-normal"
                    to={SERVICES_URL(
                      organizationId,
                      pod.qovery_service_info?.project_id,
                      pod.qovery_service_info?.environment_id
                    )}
                  >
                    {pod.qovery_service_info?.environment_name}
                  </Link>
                </>
              )}
              {pod.qovery_service_info?.environment_name && pod.qovery_service_info?.service_name && (
                <>
                  /
                  <Link
                    color="brand"
                    className="font-normal"
                    to={APPLICATION_URL(
                      organizationId,
                      pod.qovery_service_info?.project_id,
                      pod.qovery_service_info?.environment_id,
                      pod.qovery_service_info?.service_id
                    )}
                  >
                    {pod.qovery_service_info?.service_name}
                  </Link>
                </>
              )}
            </span>
          )}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-neutral-350">{timeAgo(new Date(pod.created_at), true)}</span>
          {pod.restart_count > 0 && (
            <span className="flex items-center gap-1 bg-yellow-50 px-0.5 text-yellow-900">
              <Icon iconName="arrow-rotate-left" iconStyle="regular" className="text-xs" />
              {pod.restart_count} {pluralize(pod.restart_count, 'restart', 'restarts')}
            </span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-6">
        <NodeProgressBar
          type="cpu"
          // used={formatNumber(pod.metrics_usage.cpu_milli_usage || 0)}
          total={formatNumber(pod.cpu_milli_request || 0)}
          unit="CPU"
        />
        <NodeProgressBar
          type="memory"
          // used={formatNumber(
          //   Math.max(pod.metrics_usage?.memory_mib_rss_usage || 0, pod.metrics_usage?.cpu_milli_usage || 0)
          // )}
          total={pod.memory_mib_request || 0}
          unit="MB"
        />
        {/* <NodeProgressBar
          type="disk"
          used={formatNumber(pod.metrics_usage.disk_mib_usage || 0)}
          total={formatNumber(pod.metrics_usage.disk_mib_usage || 0)} // TODO: fix it
          unit="MB"
        /> */}
      </div>
    </div>
  )
}

export const ClusterNodeRightPanel = memo(function ClusterNodeRightPanel({
  node,
  organizationId,
  clusterId,
  className,
  children,
}: ClusterNodeRightPanelProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [openSystemPods, setOpenSystemPods] = useState(false)
  const { data: runningStatus } = useClusterRunningStatus({
    organizationId,
    clusterId,
  })

  const nodeWarnings = useMemo(
    () => runningStatus?.computed_status?.node_warnings || {},
    [runningStatus?.computed_status?.node_warnings]
  )

  const isWarning = useMemo(() => Boolean(nodeWarnings[node.name]), [nodeWarnings, node.name])

  const cpuReservedPercentage = useMemo(
    () =>
      Math.round(
        calculatePercentage(
          formatNumber(milliCoreToVCPU(node.resources_allocated.request_cpu_milli)),
          formatNumber(milliCoreToVCPU(node.resources_allocatable.cpu_milli))
        )
      ),
    [node.resources_allocated.request_cpu_milli, node.resources_allocatable.cpu_milli]
  )

  const memoryReservedPercentage = useMemo(
    () =>
      Math.round(
        calculatePercentage(
          formatNumber(mibToGib(node.resources_allocated.request_memory_mib)),
          formatNumber(mibToGib(node.resources_allocatable.memory_mib))
        )
      ),
    [node.resources_allocated.request_memory_mib, node.resources_allocatable.memory_mib]
  )

  // const cpuUsedPercentage = useMemo(
  //   () =>
  //     Math.round(
  //       calculatePercentage(
  //         formatNumber(milliCoreToVCPU(node.metrics_usage?.cpu_milli_usage || 0)),
  //         formatNumber(milliCoreToVCPU(node.resources_allocatable.cpu_milli))
  //       )
  //     ),
  //   [node.metrics_usage?.cpu_milli_usage, node.resources_allocatable.cpu_milli]
  // )

  // const memoryUsedPercentage = useMemo(
  //   () =>
  //     Math.round(
  //       calculatePercentage(
  //         formatNumber(
  //           mibToGib(
  //             Math.max(
  //               node.metrics_usage?.memory_mib_rss_usage || 0,
  //               node.metrics_usage?.memory_mib_working_set_usage || 0
  //             )
  //           )
  //         ),
  //         formatNumber(mibToGib(node.resources_allocatable.memory_mib))
  //       )
  //     ),
  //   [
  //     node.metrics_usage?.memory_mib_rss_usage,
  //     node.metrics_usage?.memory_mib_working_set_usage,
  //     node.resources_allocatable.memory_mib,
  //   ]
  // )

  const isDiskPressure = useMemo(
    () => node.conditions?.some((condition) => condition.type === 'DiskPressure' && condition.status === 'True'),
    [node.conditions]
  )

  const isMemoryPressure = useMemo(
    () => node.conditions?.some((condition) => condition.type === 'MemoryPressure' && condition.status === 'True'),
    [node.conditions]
  )

  const { podsWithQoveryInfo, podsWithoutQoveryInfo } = useMemo(() => {
    const withInfo = node.pods.filter((pod) => pod.qovery_service_info?.project_name)
    const withoutInfo = node.pods.filter((pod) => !pod.qovery_service_info?.project_name)
    return {
      podsWithQoveryInfo: withInfo,
      podsWithoutQoveryInfo: withoutInfo,
    }
  }, [node.pods])

  return (
    <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen} aria-describedby="node-right-panel">
      <Dialog.Trigger asChild>
        <div
          className={twMerge(
            clsx(className, {
              'bg-neutral-100': isModalOpen,
              'bg-yellow-50': isWarning,
            })
          )}
        >
          {children}
        </div>
      </Dialog.Trigger>

      <Dialog.Portal>
        <AnimatePresence>
          {isModalOpen && (
            <>
              <Dialog.Overlay asChild>
                <motion.div
                  className="fixed inset-0 bg-neutral-700/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              </Dialog.Overlay>
              <Dialog.Content asChild>
                <motion.div
                  className="fixed right-0 top-0 h-screen max-h-screen w-[800px] overflow-auto border border-l-0 border-neutral-200 bg-neutral-50"
                  initial={{
                    opacity: 0,
                    x: '100%',
                  }}
                  animate={{
                    opacity: 1,
                    x: '0%',
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    x: '100%',
                  }}
                  transition={{
                    x: { duration: 0.32, type: 'spring', bounce: 0 },
                    ease: [0.39, 0.24, 0.3, 1],
                  }}
                >
                  <Section className="flex flex-col gap-6 p-8">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex w-full justify-between">
                        {isWarning ? (
                          <Badge variant="surface" color="yellow" className="gap-2 text-neutral-400">
                            <span className="h-2 w-2 rounded-full bg-yellow-500" />
                            Warning
                          </Badge>
                        ) : (
                          <Badge variant="surface" color="green" className="gap-2 text-neutral-400">
                            <span className="h-2 w-2 rounded-full bg-green-500" />
                            Healthy
                          </Badge>
                        )}
                        <Dialog.Close asChild>
                          <Button variant="outline" size="sm" className="h-8 w-8 justify-center text-sm">
                            <Icon iconName="xmark" />
                          </Button>
                        </Dialog.Close>
                      </div>

                      <Dialog.Title asChild>
                        <Heading level={1}>{node.name}</Heading>
                      </Dialog.Title>
                    </div>

                    <div className="grid grid-cols-2 rounded border border-neutral-250">
                      <div className="border-b border-r border-neutral-250 px-4 py-3">
                        <MetricProgressBar
                          type="cpu"
                          used={formatNumber(milliCoreToVCPU(node.metrics_usage?.cpu_milli_usage || 0))}
                          reserved={formatNumber(milliCoreToVCPU(node.resources_allocated.request_cpu_milli))}
                          total={formatNumber(milliCoreToVCPU(node.resources_allocatable.cpu_milli))}
                          // percentage={cpuUsedPercentage}
                          percentage={cpuReservedPercentage}
                          unit="vCPU"
                        />
                      </div>
                      <div
                        className={clsx('border-b border-neutral-250 px-4 py-3', {
                          'bg-yellow-50': isMemoryPressure,
                        })}
                      >
                        <MetricProgressBar
                          type="memory"
                          used={formatNumber(
                            mibToGib(
                              Math.max(
                                node.metrics_usage?.memory_mib_rss_usage || 0,
                                node.metrics_usage?.memory_mib_working_set_usage || 0
                              )
                            )
                          )}
                          reserved={formatNumber(mibToGib(node.resources_allocated.request_memory_mib))}
                          total={formatNumber(mibToGib(node.resources_allocatable.memory_mib))}
                          // percentage={memoryUsedPercentage}
                          percentage={memoryReservedPercentage}
                          isPressure={isMemoryPressure}
                          unit="GB"
                        />
                      </div>
                      <div
                        className={twMerge(
                          clsx('flex flex-col gap-1 border-r border-neutral-250 px-4 py-3', {
                            'gap-0 bg-yellow-50': isDiskPressure,
                          })
                        )}
                      >
                        <span className="text-ssm text-neutral-350">Disk</span>
                        <span className="inline-flex items-center justify-between text-sm font-medium text-neutral-400">
                          <span className={isDiskPressure ? 'text-yellow-900' : ''}>
                            {formatNumber(mibToGib(node.resources_capacity.ephemeral_storage_mib || 0))} GB
                            {/* {formatNumber(mibToGib(node.resources_capacity.ephemeral_storage_mib || 0))} GB{' '}
                            <span
                              className={clsx('font-normal text-neutral-350', {
                                'text-yellow-900': isDiskPressure,
                              })}
                            >
                              ({node.resources_capacity.ephemeral_storage_mib || 0}%)
                            </span> */}
                          </span>
                          {isDiskPressure && (
                            <Link
                              as="button"
                              variant="outline"
                              className="gap-0.5"
                              to={
                                CLUSTER_URL(organizationId, clusterId) +
                                CLUSTER_SETTINGS_URL +
                                CLUSTER_SETTINGS_RESOURCES_URL
                              }
                            >
                              Edit
                              <Tooltip content="Node has disk pressure condition. Update the size or your instance type.">
                                <span className="ml-1 inline-block text-yellow-900">
                                  <Icon iconName="info-circle" iconStyle="regular" />
                                </span>
                              </Tooltip>
                            </Link>
                          )}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 px-4 py-3">
                        <span className="text-ssm text-neutral-350">Instance type</span>
                        <span className="text-sm font-medium text-neutral-400">
                          {node.instance_type?.replace('_', ' ')}
                          {node.labels[KEY_KARPENTER_CAPACITY_TYPE] === 'spot' && ', spot'}
                        </span>
                      </div>
                    </div>

                    {podsWithQoveryInfo.length > 0 && (
                      <Section className="gap-4">
                        <Heading level={2}>Services</Heading>
                        <div className="rounded border border-neutral-250">
                          {podsWithQoveryInfo.map((pod) => (
                            <PodItem key={pod.name} pod={pod} organizationId={organizationId} />
                          ))}
                        </div>
                      </Section>
                    )}

                    {podsWithoutQoveryInfo.length > 0 && (
                      <Collapsible.Root open={openSystemPods} onOpenChange={setOpenSystemPods} asChild>
                        <Section className="gap-4">
                          <div className="flex justify-between">
                            <Heading level={2}>System Pods</Heading>
                            <Collapsible.Trigger className="flex items-center gap-2 text-sm font-medium">
                              {openSystemPods ? (
                                <>
                                  Hide <Icon iconName="chevron-up" />
                                </>
                              ) : (
                                <>
                                  Show <Icon iconName="chevron-down" />
                                </>
                              )}
                            </Collapsible.Trigger>
                          </div>
                          <Collapsible.Content>
                            <div className="rounded border border-neutral-250">
                              {podsWithoutQoveryInfo.map((pod) => (
                                <PodItem key={pod.name} pod={pod} organizationId={organizationId} />
                              ))}
                            </div>
                          </Collapsible.Content>
                        </Section>
                      </Collapsible.Root>
                    )}
                  </Section>
                </motion.div>
              </Dialog.Content>
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  )
})

export default ClusterNodeRightPanel
