import * as Dialog from '@radix-ui/react-dialog'
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
    <div className="flex animate-[fadein_0.22s_ease-in-out_forwards] justify-between overflow-hidden border-b border-neutral py-2 pl-4 pr-2 opacity-0">
      <div className="flex min-w-0 items-center gap-2">
        <Tooltip content={currentThreadHistoryTitle} delayDuration={400} disabled={!threadId || threads.length === 0}>
          <Dialog.Title asChild>
            <span className="min-w-0 truncate text-sm font-bold text-neutral">
              {!threadId || threads.length === 0 ? 'New conversation' : currentThreadHistoryTitle}
            </span>
          </Dialog.Title>
        </Tooltip>
        <Tooltip
          content="This is an experimental feature. Functionality may change, and billing terms are not final."
          delayDuration={400}
        >
          <Badge color="purple" variant="surface" size="sm">
            Beta
          </Badge>
        </Tooltip>
        {userAccess?.read_only === false && threadLength === 0 && (
          <>
            <div className="mx-1 h-5 w-[1px] bg-surface-neutral-component"></div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-subtle">{isReadOnly ? 'Read-only' : 'Read-write'}</span>
              <Tooltip content={isReadOnly ? 'Enable read-write mode' : 'Disable read-write mode'} delayDuration={400}>
                <button
                  type="button"
                  onClick={() => setIsReadOnly(!isReadOnly)}
                  className={clsx(
                    'relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
                    {
                      'bg-surface-warning-solid': !isReadOnly,
                      'bg-surface-neutral-componentActive': isReadOnly,
                    }
                  )}
                >
                  <span
                    className={clsx(
                      'inline-block h-3.5 w-3.5 transform rounded-full bg-surface-neutralInvert transition-transform',
                      {
                        'translate-x-[18px]': !isReadOnly,
                        'translate-x-0.5': isReadOnly,
                      }
                    )}
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
              <Tooltip content="Options" delayDuration={400}>
                <Button type="button" variant="plain" color="neutral" iconOnly>
                  <Icon iconName="ellipsis" />
                </Button>
              </Tooltip>
            </span>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content className="z-dropdown mr-10">
            <DropdownMenu.Item
              onClick={() => {
                controllerRef.current?.abort()
                setThread([])
                setThreadId(undefined)
                setIsLoading(false)
                setPlan([])
                setIsReadOnly(true)
              }}
              icon={<Icon iconName="pen-to-square" />}
            >
              New chat
            </DropdownMenu.Item>
            {!expand && (
              <DropdownMenu.Item icon={<Icon iconName="file-archive" />} onClick={() => setExpand(true)}>
                Show history
              </DropdownMenu.Item>
            )}
            <DropdownMenu.Item asChild icon={<Icon iconName="user-group" />}>
              <a href={QOVERY_FORUM_URL} target="_blank" rel="noopener noreferrer">
                Community forum
              </a>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild icon={<Icon iconName="comment-lines" />}>
              <a href={QOVERY_FEEDBACK_URL} target="_blank" rel="noopener noreferrer">
                Feedback
              </a>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
        <div className="mx-1 h-5 w-[1px] bg-surface-neutral-component"></div>
        <Tooltip content={expand ? 'Collapse modal' : 'Take conversation to immersive'} delayDuration={400}>
          <Button type="button" variant="plain" color="neutral" iconOnly onClick={() => setExpand(!expand)}>
            <Icon iconName={expand ? 'compress' : 'expand'} />
          </Button>
        </Tooltip>
        <Tooltip content="Close" delayDuration={400}>
          <Button type="button" variant="plain" color="neutral" iconOnly onClick={handleOnClose}>
            <Icon iconName="xmark" />
          </Button>
        </Tooltip>
      </div>
    </div>
  )
}
