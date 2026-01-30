import clsx from 'clsx'
import { type MutableRefObject } from 'react'
import { Badge, Button, DropdownMenu, Icon, Tooltip } from '@qovery/shared/ui'
import { QOVERY_FEEDBACK_URL, QOVERY_FORUM_URL } from '@qovery/shared/util-const'
import type { Message, PlanStep } from '../devops-copilot-panel'

interface HeaderProps {
  threadId?: string
  threads: Array<{ id: string; title: string }>
  currentThreadHistoryTitle: string
  userAccess?: { read_only?: boolean }
  isReadOnly: boolean
  setIsReadOnly: (value: boolean) => void
  threadLength: number
  expand: boolean
  setExpand: (value: boolean) => void
  handleOnClose: () => void
  controllerRef: MutableRefObject<AbortController | null>
  setThread: (thread: Message[]) => void
  setThreadId: (id: string | undefined) => void
  setIsLoading: (value: boolean) => void
  setPlan: (plan: PlanStep[]) => void
}

export function Header({
  threadId,
  threads,
  currentThreadHistoryTitle,
  userAccess,
  isReadOnly,
  setIsReadOnly,
  threadLength,
  expand,
  setExpand,
  handleOnClose,
  controllerRef,
  setThread,
  setThreadId,
  setIsLoading,
  setPlan,
}: HeaderProps) {
  return (
    <div className="flex animate-[fadein_0.22s_ease-in-out_forwards] justify-between overflow-hidden border-b border-neutral-200 py-2 pl-4 pr-2 opacity-0 dark:border-neutral-500">
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-neutral-500 dark:text-white">
          {!threadId || threads.length === 0
            ? 'New conversation'
            : currentThreadHistoryTitle.length >= 45
              ? currentThreadHistoryTitle + '...'
              : currentThreadHistoryTitle}
        </span>
        <Tooltip
          content="This is an experimental feature. Functionality may change, and billing terms are not final."
          delayDuration={400}
          classNameContent="z-10"
        >
          <Badge color="purple" variant="surface" size="sm">
            Beta
          </Badge>
        </Tooltip>
        {userAccess?.read_only === false && threadLength === 0 && (
          <>
            <div className="mx-1 h-5 w-[1px] bg-neutral-200 dark:bg-neutral-500"></div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 dark:text-neutral-250">
                {isReadOnly ? 'Read-only' : 'Read-write'}
              </span>
              <Tooltip
                content={isReadOnly ? 'Enable read-write mode' : 'Disable read-write mode'}
                delayDuration={400}
                classNameContent="z-10"
              >
                <button
                  type="button"
                  onClick={() => setIsReadOnly(!isReadOnly)}
                  className={clsx(
                    'relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
                    {
                      'bg-orange-500': !isReadOnly,
                      'bg-neutral-300': isReadOnly,
                    }
                  )}
                >
                  <span
                    className={clsx('inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform', {
                      'translate-x-[18px]': !isReadOnly,
                      'translate-x-0.5': isReadOnly,
                    })}
                  />
                </button>
              </Tooltip>
            </div>
          </>
        )}
      </div>
      <div className="flex items-center gap-1">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <span>
              <Tooltip content="Options" delayDuration={400} classNameContent="z-10">
                <Button type="button" variant="plain" className="text-neutral-500 dark:text-white">
                  <Icon iconName="ellipsis" />
                </Button>
              </Tooltip>
            </span>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content className="z-10 mr-10">
            <DropdownMenu.Item asChild>
              <button
                className="flex h-11 w-full items-center gap-2 text-sm"
                type="button"
                onClick={() => {
                  controllerRef.current?.abort()
                  setThread([])
                  setThreadId(undefined)
                  setIsLoading(false)
                  setPlan([])
                  setIsReadOnly(true)
                }}
              >
                <span className="w-4">
                  <Icon iconName="pen-to-square" className="text-brand-500" />
                </span>
                <span>New chat</span>
              </button>
            </DropdownMenu.Item>
            {!expand && (
              <DropdownMenu.Item asChild>
                <button
                  className="flex h-11 w-full items-center gap-2 text-sm"
                  type="button"
                  onClick={() => setExpand(true)}
                >
                  <span className="w-4">
                    <Icon iconName="file-archive" className="text-brand-500" />
                  </span>
                  <span>Show history</span>
                </button>
              </DropdownMenu.Item>
            )}
            <DropdownMenu.Item asChild>
              <a
                className="flex h-11 w-full items-center gap-2 text-sm"
                href={QOVERY_FORUM_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="w-4">
                  <Icon iconName="user-group" className="text-brand-500" />
                </span>
                <span>Community forum</span>
              </a>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <a
                className="flex h-11 w-full items-center gap-2 text-sm"
                href={QOVERY_FEEDBACK_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="w-4">
                  <Icon iconName="comment-lines" className="text-brand-500" />
                </span>
                <span>Feedback</span>
              </a>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
        <div className="mx-1 h-5 w-[1px] bg-neutral-200 dark:bg-neutral-500"></div>
        <Tooltip
          content={expand ? 'Collapse modal' : 'Take conversation to immersive'}
          delayDuration={400}
          classNameContent="z-10"
        >
          <Button
            type="button"
            variant="plain"
            className="text-neutral-500 dark:text-white"
            onClick={() => setExpand(!expand)}
          >
            <Icon iconName={expand ? 'compress' : 'expand'} />
          </Button>
        </Tooltip>
        <Tooltip content="Close" delayDuration={400} classNameContent="z-10">
          <Button type="button" variant="plain" onClick={handleOnClose} className="text-neutral-500 dark:text-white">
            <Icon iconName="xmark" />
          </Button>
        </Tooltip>
      </div>
    </div>
  )
}
