import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { type PropsWithChildren, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { type AnyService } from '@qovery/domains/services/data-access'
import { type Pod, useMetrics, useRunningStatus } from '@qovery/domains/services/feature'
import { ENVIRONMENT_LOGS_URL, SERVICE_LOGS_URL } from '@qovery/shared/routes'
import { Icon, Link, Skeleton, Tooltip } from '@qovery/shared/ui'
import { dateFullFormat, dateUTCString } from '@qovery/shared/util-dates'
import { twMerge } from '@qovery/shared/util-js'
import { usePodColor } from '../list-service-logs/use-pod-color'
import { DonutChart } from './donut-chart/donut-chart'

export interface SidebarPodStatusesProps extends PropsWithChildren {
  organizationId: string
  projectId: string
  service?: AnyService
}

const PADDING_SIDEBAR_DEFAULT = '16px'
const PADDING_SIDEBAR_CLOSE = '93px'
const PADDING_SIDEBAR_OPEN = '47px'

export function SidebarPodStatuses({ organizationId, projectId, service, children }: SidebarPodStatusesProps) {
  const { data: metrics = [], isLoading: isMetricsLoading } = useMetrics({
    environmentId: service?.environment.id,
    serviceId: service?.id,
  })
  const { data: runningStatuses, isLoading: isRunningStatusesLoading } = useRunningStatus({
    environmentId: service?.environment.id,
    serviceId: service?.id,
  })
  const [searchParams] = useSearchParams()
  const getColorByPod = usePodColor()

  const pods: Pod[] = useMemo(() => {
    // NOTE: metrics or runningStatuses could be undefined because backend doesn't have the info.
    // So we must find all possible pods by merging the two into a Set.
    const podNames = new Set([
      ...(runningStatuses?.pods.map(({ name }) => name) ?? []),
      ...(metrics?.map(({ pod_name }) => pod_name) ?? []),
    ])

    return [...podNames].map((podName) => ({
      ...(metrics?.find(({ pod_name }) => pod_name === podName) ?? {}),
      ...(runningStatuses?.pods.find(({ name }) => name === podName) ?? {}),
      podName,
    }))
  }, [metrics, runningStatuses])

  const podsErrors = useMemo(() => pods.filter((pod) => pod.state === 'ERROR'), [pods])

  const podStatusCount = useMemo(() => {
    return pods.reduce(
      (acc, pod) => {
        const status = match(pod.state)
          .with('RUNNING', () => ({ type: 'running', message: 'running', color: 'bg-green-500' }))
          .with('COMPLETED', () => ({ type: 'running', message: 'completed', color: 'bg-green-500' }))
          .with('WARNING', () => ({ type: 'warning', message: 'warning', color: 'bg-yellow-500' }))
          .with('STARTING', () => ({
            type: 'running',
            message: 'starting',
            color: 'bg-purple-500',
          }))
          .with('STOPPING', () => ({
            type: 'pending',
            message: 'pending',
            color: 'bg-purple-500',
          }))
          .with('ERROR', () => ({ type: 'error', message: 'failing', color: 'bg-red-500' }))
          .otherwise(() => ({ type: 'other', message: 'skipped', color: 'bg-neutral-400' }))

        acc[status.type] = {
          count: (acc[status.type]?.count || 0) + 1,
          message: status.message,
          color: status.color,
        }
        return acc
      },
      {} as Record<string, { count: number; message: string; color: string }>
    )
  }, [pods])

  const shouldBeOpen = useMemo(() => {
    if (isMetricsLoading || isRunningStatusesLoading) return false
    return podsErrors.length > 0 && runningStatuses?.state !== 'STOPPED'
  }, [isMetricsLoading, isRunningStatusesLoading, podsErrors.length, runningStatuses?.state])

  const [open, setOpen] = useState(shouldBeOpen)

  const currentPadding = useMemo(() => {
    if (isMetricsLoading || isRunningStatusesLoading) return PADDING_SIDEBAR_CLOSE
    if (runningStatuses?.state === 'STOPPED') return PADDING_SIDEBAR_DEFAULT
    return open ? PADDING_SIDEBAR_OPEN : PADDING_SIDEBAR_CLOSE
  }, [isMetricsLoading, isRunningStatusesLoading, runningStatuses?.state, open])

  const toggleOpen = () => {
    setOpen(!open)
  }

  const segments = useMemo(() => {
    if (!pods.length) return []

    const statusCount = pods.reduce(
      (acc, pod) => {
        const color = match(pod.state)
          .with('RUNNING', 'COMPLETED', () => 'GREEN')
          .with('WARNING', () => 'YELLOW')
          .with('STARTING', 'STOPPING', () => 'PURPLE')
          .with('ERROR', () => 'RED')
          .otherwise(() => 'GREY')

        acc[color] = (acc[color] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const total = pods.length

    const colors: Record<string, string> = {
      GREEN: '#44C979', // Green for running pods
      YELLOW: '#FBE267', // Yellow for warning pods
      PURPLE: '#847AE6', // Purple for starting, stopping, completed pods
      RED: '#FF6240', // Red for error pods
      GREY: '#67778E', // Gray for other pods
    }

    return Object.entries(statusCount).map(([status, count]) => ({
      color: colors[status],
      value: Math.round((count / total) * 100),
    }))
  }, [pods])

  if (isMetricsLoading || isRunningStatusesLoading) {
    return children
  }

  return (
    <div className="flex" style={{ '--padding-sidebar': currentPadding } as React.CSSProperties}>
      {children}
      {service && segments.length > 0 && (
        <motion.aside
          className="relative my-1 -mr-[317px] flex h-[calc(100vh-72px)] w-[330px] border border-r-0 border-neutral-500 bg-neutral-600"
          animate={{
            marginRight: open ? '0' : '-317px',
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
        >
          <div
            className={twMerge(
              'group h-full w-[10px] min-w-[10px] cursor-pointer bg-neutral-600 transition-colors hover:bg-neutral-500 group-hover:bg-neutral-500'
            )}
            onClick={toggleOpen}
          >
            <button
              type="button"
              onClick={toggleOpen}
              className={twMerge(
                clsx(
                  'absolute top-1 flex h-9 items-center justify-center gap-1.5 rounded-l-full border border-r-0 border-neutral-500 bg-neutral-600 pl-2 pr-1 text-xs transition-colors group-hover:bg-neutral-500',
                  {
                    '-left-[80px]': !open,
                    '-left-9 w-9 pl-3 pr-2': open,
                  }
                )
              )}
            >
              {!open && (
                <>
                  <Skeleton className="flex items-center gap-1.5" show={segments.length === 0} width={54} height={16}>
                    <DonutChart width={21} height={21} items={segments} innerRadius={7} outerRadius={10} />
                    {service.serviceType === 'JOB' ? 'Jobs' : 'Pods'}
                  </Skeleton>{' '}
                </>
              )}{' '}
              <Icon iconName={!open ? 'angle-left' : 'angle-right'} />
            </button>
          </div>
          <AnimatePresence>
            {open && (
              <motion.div
                className="w-ful flex h-full min-w-[320px] flex-col gap-4 overflow-y-scroll p-4 pl-1.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex flex-col items-center justify-center gap-4 rounded bg-neutral-550 p-6">
                  <DonutChart width={81} height={81} items={segments} innerRadius={30} outerRadius={40} />
                  <div className="flex flex-col items-center gap-1 text-center">
                    <p className="text-sm font-medium">
                      {podsErrors.length > 0
                        ? `${service.serviceType === 'JOB' ? 'Jobs' : 'Pods'} were not successful`
                        : `${service.serviceType === 'JOB' ? 'Jobs' : 'Pods'} are running`}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 text-sm">
                      {Object.entries(podStatusCount).map(
                        ([status, { count, color, message }]) =>
                          count > 0 && (
                            <p key={status} className="flex items-center gap-2">
                              <span className={`relative top-[1px] block h-2 w-2 rounded-full ${color}`}></span>
                              {count} {message}
                            </p>
                          )
                      )}
                    </div>
                  </div>
                </div>
                {podsErrors.length ? (
                  service.serviceType === 'JOB' ? (
                    // Display list of errors for jobs
                    podsErrors
                      .sort((a, b) => new Date(b.started_at ?? '').getTime() - new Date(a.started_at ?? '').getTime())
                      .map((pod) => {
                        return (
                          <div
                            key={pod.podName}
                            className="flex flex-col gap-3 rounded border-l-4 border-red-500 bg-neutral-650 p-3 pl-5 text-sm"
                          >
                            <p className="flex flex-col gap-1">
                              {pod.started_at && (
                                <span className="flex text-xs text-red-400" title={dateUTCString(pod.started_at)}>
                                  {dateFullFormat(pod.started_at)}
                                </span>
                              )}
                              {pod.state_reason}:{pod.state_message}
                            </p>
                            <div className="flex gap-1">
                              <Tooltip content={pod.podName}>
                                <Link
                                  as="button"
                                  variant="surface"
                                  color="neutral"
                                  size="xs"
                                  to={
                                    ENVIRONMENT_LOGS_URL(organizationId, projectId, service.environment.id) +
                                    SERVICE_LOGS_URL(
                                      service?.id,
                                      searchParams.get('pod_name') === pod.podName ? '' : pod.podName
                                    )
                                  }
                                  className={twMerge(
                                    clsx('gap-1.5 font-code', {
                                      'outline outline-1 outline-brand-400 hover:!border-brand-400 dark:border-brand-400':
                                        searchParams.get('pod_name') === pod.podName,
                                    })
                                  )}
                                >
                                  <span
                                    className="block h-1.5 w-1.5 min-w-1.5 rounded-sm"
                                    style={{ backgroundColor: getColorByPod(pod.podName) }}
                                  />
                                  {pod.podName.substring(pod.podName.length - 5)}
                                </Link>
                              </Tooltip>
                            </div>
                          </div>
                        )
                      })
                  ) : (
                    // Group similar errors for services
                    Object.entries(
                      podsErrors.reduce(
                        (acc, pod) => {
                          const errorKey = `${pod.state_reason}:${pod.state_message}`
                          if (!acc[errorKey]) {
                            acc[errorKey] = {
                              error: { reason: pod.state_reason || '', message: pod.state_message || '' },
                              pods: [],
                            }
                          }
                          acc[errorKey].pods.push(pod)
                          return acc
                        },
                        {} as Record<string, { error: { reason: string; message: string }; pods: Pod[] }>
                      )
                    ).map(([errorKey, { error, pods }]) => (
                      <div
                        key={errorKey}
                        className="flex flex-col gap-3 rounded border-l-4 border-red-500 bg-neutral-650 p-3 pl-5 text-sm"
                      >
                        <p>
                          {error.reason}:{error.message}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {pods.map((pod) => (
                            <Tooltip key={pod.podName} content={pod.podName}>
                              <Link
                                as="button"
                                variant="surface"
                                color="neutral"
                                size="xs"
                                to={
                                  ENVIRONMENT_LOGS_URL(organizationId, projectId, service.environment.id) +
                                  SERVICE_LOGS_URL(
                                    service?.id,
                                    searchParams.get('pod_name') === pod.podName ? '' : pod.podName
                                  )
                                }
                                className={twMerge(
                                  clsx('gap-1.5 font-code', {
                                    'outline outline-1 outline-brand-400 hover:!border-brand-400 dark:border-brand-400':
                                      searchParams.get('pod_name') === pod.podName,
                                  })
                                )}
                              >
                                <span
                                  className="block h-1.5 w-1.5 min-w-1.5 rounded-sm"
                                  style={{ backgroundColor: getColorByPod(pod.podName) }}
                                />
                                {pod.podName.substring(pod.podName.length - 5)}
                              </Link>
                            </Tooltip>
                          ))}
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  <div className="flex h-32 w-full flex-col items-center justify-center rounded bg-neutral-550 text-sm">
                    <p className="mb-1 font-medium">Everything running fine</p>
                    <span className="text-neutral-250">Any errors will be displayed here</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.aside>
      )}
    </div>
  )
}

export default SidebarPodStatuses