import clsx from 'clsx'
import { memo } from 'react'
import { Button, Icon, LoaderSpinner, Tooltip, truncateText } from '@qovery/shared/ui'
import { type Thread } from '../hooks/use-threads/use-threads'
import { isToday, isWithinLastSevenDays, isWithinLastThirtyDays, isYesterday } from '../utils/date-utils/date-utils'

interface GroupedThreads {
  today: Thread[]
  yesterday: Thread[]
  lastSevenDays: Thread[]
  lastThirtyDays: Thread[]
}

export const DevopsCopilotHistory = ({
  data,
  threadId,
  setThreadId,
}: {
  data: {
    threads: Thread[]
    error: string | null
    isLoading: boolean
    refetchThreads?: () => void
  }
  threadId?: string
  organizationId: string
  setThreadId: (id?: string) => void
}) => {
  const { threads = [], isLoading, error } = data

  const groupThreadsByTimeAgo = (threads: Thread[]): GroupedThreads => {
    const emptyGroups: GroupedThreads = {
      today: [],
      yesterday: [],
      lastSevenDays: [],
      lastThirtyDays: [],
    }

    return threads.reduce((acc: GroupedThreads, thread) => {
      const threadDate = new Date(thread.updated_at)

      if (isToday(threadDate)) {
        acc.today.push(thread)
      } else if (isYesterday(threadDate)) {
        acc.yesterday.push(thread)
      } else if (isWithinLastSevenDays(threadDate)) {
        acc.lastSevenDays.push(thread)
      } else if (isWithinLastThirtyDays(threadDate)) {
        acc.lastThirtyDays.push(thread)
      }

      return acc
    }, emptyGroups)
  }

  const ThreadGroup = ({ title, threads }: { title: string; threads: Thread[] }) => {
    if (threads.length === 0) return null

    return (
      <div className="mb-4">
        <div className="p-2 text-xs font-medium text-neutral-subtle">{title}</div>
        {threads.map((thread) => (
          <Tooltip key={thread.id} side="right" content={thread.title} delayDuration={400} classNameContent="z-10">
            <div
              onClick={() => setThreadId(thread.id)}
              className={clsx(
                'cursor-pointer rounded-md p-2 text-sm text-neutral transition-colors hover:bg-surface-neutral-subtle',
                {
                  'bg-surface-brand-subtle text-brand': threadId === thread.id,
                }
              )}
            >
              {thread.title.length >= 28 ? `${truncateText(thread.title, 28)}...` : thread.title}
            </div>
          </Tooltip>
        ))}
      </div>
    )
  }

  if (isLoading && threads.length === 0) {
    return (
      <div className="flex h-full w-80 items-center justify-center">
        <div className="text-sm text-neutral-subtle">
          <LoaderSpinner className="h-6 w-6" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full w-80 items-center justify-center">
        <div className="text-sm text-negative">{error}</div>
      </div>
    )
  }

  const groupedThreads = groupThreadsByTimeAgo(threads)

  return (
    <div className="flex h-full w-80 flex-col justify-between border-r border-neutral">
      <div className="flex h-[45px] justify-between border-b border-neutral py-2 pl-4 pr-2">
        <div className="flex w-full items-center justify-between font-bold">
          <span className="text-sm text-neutral">History</span>
          <Tooltip side="bottom" content="New chat" delayDuration={400} classNameContent="z-10">
            <span>
              <Button
                type="button"
                variant="plain"
                className="text-neutral-subtle hover:text-neutral"
                onClick={() => setThreadId(undefined)}
              >
                <Icon iconName="pen-to-square" iconStyle="regular" />
              </Button>
            </span>
          </Tooltip>
        </div>
      </div>
      <div className="mt-2 flex-1 overflow-y-auto px-2">
        <ThreadGroup title="Today" threads={groupedThreads.today} />
        <ThreadGroup title="Yesterday" threads={groupedThreads.yesterday} />
        <ThreadGroup title="Last 7 days" threads={groupedThreads.lastSevenDays} />
        <ThreadGroup title="Last 30 days" threads={groupedThreads.lastThirtyDays} />
      </div>
    </div>
  )
}

export default memo(DevopsCopilotHistory, (prev, next) => {
  const propsChanged = {
    threadIdChanged: prev.threadId !== next.threadId,
    orgIdChanged: prev.organizationId !== next.organizationId,
    threadsRefChanged: prev.data.threads !== next.data.threads,
    isLoadingChanged: prev.data.isLoading !== next.data.isLoading,
    errorChanged: prev.data.error !== next.data.error,
  }
  return !Object.values(propsChanged).some(Boolean)
})
