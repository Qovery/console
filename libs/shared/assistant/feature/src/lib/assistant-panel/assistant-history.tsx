import { type Thread } from './assistant-panel'

const threads = [
  {
    id: 'thread_01HNYP2K3ZGJX8V5D6Q7RMW4NS',
    title: 'Incident investigation...',
    created_at: '2024-02-20T08:30:15Z',
  },
  {
    id: 'thread_01HNYP4M7TQJX8V5D6Q7RMW4NT',
    title: 'Database optimization...',
    created_at: '2024-02-19T15:45:22Z',
  },
  {
    id: 'thread_01HNYP6N8WKJX8V5D6Q7RMW4NU',
    title: 'Security patch deployment...',
    created_at: '2024-02-18T11:20:33Z',
  },
  {
    id: 'thread_01HNYP8P9XLJX8V5D6Q7RMW4NV',
    title: 'Load balancer configuration...',
    created_at: '2024-02-17T09:15:47Z',
  },
  {
    id: 'thread_01HNYPAQ0YMJX8V5D6Q7RMW4NW',
    title: 'CI/CD pipeline performance...',
    created_at: '2024-02-16T14:50:08Z',
  },
]

interface Threads {
  id: string
  title: string
  created_at: string
}

interface GroupedThreads {
  today?: Threads[]
  yesterday?: Threads[]
  lastSevenDays?: Threads[]
  lastThirtyDays?: Threads[]
}

const groupThreadsByTimeAgo = (threads: Threads[]): GroupedThreads => {
  const now = new Date().getTime()

  return threads.reduce((acc: GroupedThreads, thread) => {
    const threadDate = new Date(thread.created_at).getTime()
    const diffInDays = Math.floor((now - threadDate) / (1000 * 60 * 60 * 24))
    const diffInHours = Math.floor((now - threadDate) / (1000 * 60 * 60))

    if (diffInHours < 24) {
      acc.today = [...(acc.today || []), thread]
    } else if (diffInDays <= 1) {
      acc.yesterday = [...(acc.yesterday || []), thread]
    } else if (diffInDays <= 7) {
      acc.lastSevenDays = [...(acc.lastSevenDays || []), thread]
    } else {
      acc.lastThirtyDays = [...(acc.lastThirtyDays || []), thread]
    }

    return acc
  }, {})
}

export function AssistantHistory({ thread }: { thread: Thread }) {
  const groupedThreads = groupThreadsByTimeAgo([
    ...(thread.length > 0
      ? [
          {
            id: '1',
            title: thread[0].text?.substring(0, 20),
            created_at: new Date().toDateString(),
          },
        ]
      : []),
    ...threads,
  ])

  return (
    <div className="flex h-full w-80 flex-col justify-between border-r border-neutral-200 dark:border-neutral-500">
      <div className="flex h-[45px] animate-[fadein_0.22s_ease-in-out_forwards] justify-between border-b border-neutral-200 py-2 pl-4 pr-2 opacity-0 dark:border-neutral-500">
        <div className="flex items-center font-bold">
          <span className="text-sm text-neutral-500 dark:text-white">History</span>
        </div>
      </div>
      <div className="mt-2 flex-1 overflow-y-auto px-2">
        {groupedThreads.today && groupedThreads.today.length > 0 && (
          <div className="mb-4">
            <div className="p-2 text-xs font-medium text-neutral-500 dark:text-neutral-300">Today</div>
            {groupedThreads.today.map((thread) => (
              <div
                key={thread.id}
                className="cursor-pointer rounded-md p-2 text-sm hover:bg-neutral-200 dark:text-neutral-50 dark:hover:bg-neutral-400"
              >
                <div className="text-sm">{thread.title}</div>
              </div>
            ))}
          </div>
        )}

        {groupedThreads.yesterday && groupedThreads.yesterday.length > 0 && (
          <div className="mb-4">
            <div className="p-2 text-xs font-medium text-neutral-500 dark:text-neutral-300">Yesterday</div>
            {groupedThreads.yesterday.map((thread) => (
              <div
                key={thread.id}
                className="cursor-pointer rounded-md p-2 text-sm hover:bg-neutral-200 dark:text-neutral-50 dark:hover:bg-neutral-400"
              >
                <div className="text-sm">{thread.title}</div>
              </div>
            ))}
          </div>
        )}

        {groupedThreads.lastSevenDays && groupedThreads.lastSevenDays.length > 0 && (
          <div className="mb-4">
            <div className="p-2 text-xs font-medium text-neutral-500 dark:text-neutral-300">Last 7 days</div>
            {groupedThreads.lastSevenDays.map((thread) => (
              <div
                key={thread.id}
                className="cursor-pointer rounded-md p-2 text-sm hover:bg-neutral-200 dark:text-neutral-50 dark:hover:bg-neutral-400"
              >
                <div className="text-sm">{thread.title}</div>
              </div>
            ))}
          </div>
        )}

        {groupedThreads.lastThirtyDays && groupedThreads.lastThirtyDays.length > 0 && (
          <div className="mb-4">
            <div className="p-2 text-xs font-medium text-neutral-500 dark:text-neutral-300">Last 30 days</div>
            {groupedThreads.lastThirtyDays.map((thread) => (
              <div
                key={thread.id}
                className="cursor-pointer rounded-md p-2 text-sm hover:bg-neutral-200 dark:text-neutral-50 dark:hover:bg-neutral-400"
              >
                <div className="text-sm">{thread.title}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AssistantHistory
