import clsx from 'clsx'
import { Button, Icon, LoaderSpinner, Tooltip, truncateText } from '@qovery/shared/ui'
import { type Thread } from './use-threads'

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

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isYesterday = (date: Date) => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    )
  }

  const isWithinLastSevenDays = (date: Date) => {
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return date > sevenDaysAgo && !isToday(date) && !isYesterday(date)
  }

  const isWithinLastThirtyDays = (date: Date) => {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return date > thirtyDaysAgo && date <= sevenDaysAgo
  }

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
        <div className="p-2 text-xs font-medium text-neutral-500 dark:text-neutral-300">{title}</div>
        {threads.map((thread) => (
          <div
            key={thread.id}
            onClick={() => setThreadId(thread.id)}
            className={clsx(
              'cursor-pointer rounded-md p-2 text-sm transition-colors hover:bg-brand-50 dark:text-neutral-50 dark:hover:bg-neutral-400',
              {
                'bg-brand-50 dark:bg-neutral-400': threadId === thread.id,
              }
            )}
          >
            {thread.title.length >= 28 ? `${truncateText(thread.title, 28)}...` : thread.title}
          </div>
        ))}
      </div>
    )
  }

  if (isLoading && threads.length === 0) {
    return (
      <div className="flex h-full w-80 items-center justify-center">
        <div className="text-sm text-neutral-500">
          <LoaderSpinner className="h-6 w-6" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full w-80 items-center justify-center">
        <div className="text-sm text-red-500">{error}</div>
      </div>
    )
  }

  const groupedThreads = groupThreadsByTimeAgo(threads)

  return (
    <div className="flex h-full w-80 flex-col justify-between border-r border-neutral-200 dark:border-neutral-500">
      <div className="flex h-[45px] justify-between border-b border-neutral-200 py-2 pl-4 pr-2 dark:border-neutral-500">
        <div className="flex w-full items-center justify-between font-bold">
          <span className="text-sm text-neutral-500 dark:text-white">History</span>
          <Tooltip side="bottom" content="New chat" delayDuration={400} classNameContent="z-10">
            <span>
              <Button
                type="button"
                variant="plain"
                className="text-neutral-500 dark:text-white"
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

export default DevopsCopilotHistory
