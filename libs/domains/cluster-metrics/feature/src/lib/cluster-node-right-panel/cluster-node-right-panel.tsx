import * as Dialog from '@radix-ui/react-dialog'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { type ClusterNodeDto } from 'qovery-ws-typescript-axios'
import { type PropsWithChildren, useMemo, useState } from 'react'
import { useClusterRunningStatus } from '@qovery/domains/clusters/feature'
import { Badge, Button, Heading, Icon, Section } from '@qovery/shared/ui'
import { calculatePercentage, formatNumber, mibToGib, milliCoreToVCPU, twMerge } from '@qovery/shared/util-js'
import ClusterProgressBarNode from '../cluster-progress-bar-node/cluster-progress-bar-node'

export interface ClusterNodeRightPanelProps extends PropsWithChildren {
  organizationId: string
  clusterId: string
  node: ClusterNodeDto
  className?: string
}

const KEY_KARPENTER_NODE_POOL = 'karpenter.sh/nodepool'
const KEY_KARPENTER_CAPACITY_TYPE = 'karpenter.sh/capacity-type'

interface MetricProgressBarProps {
  type: 'cpu' | 'memory'
  used: number
  reserved: number
  total: number
  percentage: number
  unit: string
}

function MetricProgressBar({ type, used, reserved, total, percentage, unit }: MetricProgressBarProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-ssm text-neutral-350">{type === 'cpu' ? 'CPU' : 'Memory'}</span>
      <span className="mb-1.5 font-semibold text-neutral-400">{percentage}%</span>
      <ClusterProgressBarNode used={used} reserved={reserved} total={total} />
      <div className="mt-1.5 flex gap-6 text-xs text-neutral-400">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 bg-brand-400"></span>
          Used: {used} {unit}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 border border-purple-500 bg-purple-200"></span>
          Reserved: {used} {unit}
        </div>
      </div>
    </div>
  )
}

export function ClusterNodeRightPanel({
  node,
  organizationId,
  clusterId,
  className,
  children,
}: ClusterNodeRightPanelProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data: runningStatus } = useClusterRunningStatus({
    organizationId,
    clusterId,
  })

  const nodeWarnings = useMemo(
    () => runningStatus?.computed_status?.node_warnings || {},
    [runningStatus?.computed_status?.node_warnings]
  )
  const isWarning = Boolean(nodeWarnings[node.name])

  const cpuUsedPercentage = Math.round(
    calculatePercentage(
      formatNumber(milliCoreToVCPU(node.metrics_usage?.cpu_milli_usage || 0)),
      formatNumber(milliCoreToVCPU(node.resources_allocatable.cpu_milli))
    )
  )

  const memoryUsedPercentage = Math.round(
    calculatePercentage(
      formatNumber(
        mibToGib(
          Math.max(node.metrics_usage?.memory_mib_rss_usage || 0, node.metrics_usage?.memory_mib_working_set_usage || 0)
        )
      ),
      formatNumber(mibToGib(node.resources_allocatable.memory_mib))
    )
  )

  return (
    <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
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
                          percentage={cpuUsedPercentage}
                          unit="vCPU"
                        />
                      </div>
                      <div className="border-b border-neutral-250 px-4 py-3">
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
                          percentage={memoryUsedPercentage}
                          unit="GB"
                        />
                      </div>
                      <div className="flex flex-col gap-1 border-r border-neutral-250 px-4 py-3">
                        <span className="text-ssm text-neutral-350">Disk</span>
                        <span className="text-sm font-medium text-neutral-400">
                          {formatNumber(mibToGib(node.metrics_usage?.disk_mib_usage || 0))} GB{' '}
                          <span className="font-normal text-neutral-350">
                            ({node.metrics_usage?.disk_percent_usage || 0}%)
                          </span>
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
                  </Section>
                </motion.div>
              </Dialog.Content>
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default ClusterNodeRightPanel
