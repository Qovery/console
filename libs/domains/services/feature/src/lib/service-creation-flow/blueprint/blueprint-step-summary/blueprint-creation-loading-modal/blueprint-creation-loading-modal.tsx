import * as Dialog from '@radix-ui/react-dialog'
import { type EnvironmentLogs } from 'qovery-typescript-axios'
import { useLayoutEffect, useRef } from 'react'
import { LogsType } from '@qovery/shared/enums'
import { Ansi, Button, Heading, Icon } from '@qovery/shared/ui'
import { dateFullFormat } from '@qovery/shared/util-dates'

export interface BlueprintCreationLoadingModalProps {
  // False when the dispatch never reported an outcome and may still be running, so retrying would
  // risk a second service
  canRetry?: boolean
  // Set when the failure was reported by the API rather than by the deployment logs, which a
  // failed dispatch never emits
  errorMessage?: string
  logs: EnvironmentLogs[]
  onEditConfig: () => void
  /** Offered when the outcome is unknown, so the user is never left with no way forward */
  onGoToEnvironment: () => void
  onRetry: () => void
  open: boolean
  serviceName: string
}

export function BlueprintCreationLoadingModal({
  canRetry = true,
  errorMessage,
  logs,
  onEditConfig,
  onGoToEnvironment,
  onRetry,
  open,
  serviceName,
}: BlueprintCreationLoadingModalProps) {
  const hasError = Boolean(errorMessage) || logs.some((log) => log.type === LogsType.ERROR)
  const logsContainerRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const logsContainer = logsContainerRef.current
    if (!logsContainer || (logs.length === 0 && !errorMessage)) return

    logsContainer.scrollTop = logsContainer.scrollHeight
  }, [logs, errorMessage])

  return (
    <Dialog.Root open={open} onOpenChange={() => undefined}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-overlay bg-background-overlay" />
        <Dialog.Content
          aria-describedby="blueprint-creation-loading-description"
          className="fixed left-1/2 top-1/2 z-overlay flex h-[480px] w-[680px] max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-md border border-neutral bg-surface-neutral shadow-lg focus:outline-none"
          onEscapeKeyDown={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
        >
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-neutral px-5 py-5">
            <Dialog.Title asChild>
              <Heading level={1} className="min-w-0 flex-1 truncate leading-8">
                Creating <span className="text-neutral-subtle">{serviceName}</span>
                {hasError ? '' : '...'}
              </Heading>
            </Dialog.Title>
            {hasError && (
              <div className="flex shrink-0 items-center gap-2">
                <Button type="button" variant="outline" color="neutral" size="md" onClick={onEditConfig}>
                  <Icon iconName="pen" iconStyle="regular" />
                  Edit config
                </Button>
                {canRetry ? (
                  <Button type="button" size="md" onClick={onRetry}>
                    <Icon iconName="arrow-rotate-right" iconStyle="regular" />
                    Retry
                  </Button>
                ) : (
                  <Button type="button" size="md" onClick={onGoToEnvironment}>
                    <Icon iconName="arrow-right" iconStyle="regular" />
                    Go to environment
                  </Button>
                )}
              </div>
            )}
            <Dialog.Description id="blueprint-creation-loading-description" className="sr-only">
              Blueprint service creation logs.
            </Dialog.Description>
          </div>

          <div
            ref={logsContainerRef}
            className="min-h-0 flex-1 overflow-auto bg-surface-neutral-subtle py-3 font-code text-xs leading-5 text-neutral"
            role="log"
          >
            <div className="flex flex-col gap-1">
              {logs.map((log) => {
                const isError = log.type === LogsType.ERROR
                const message = isError ? log.error?.user_log_message : log.message?.safe_message

                return (
                  <div
                    key={log.timestamp}
                    className={isError ? 'bg-surface-negative-subtle px-5 text-negative' : 'px-5 text-neutral'}
                  >
                    <span
                      className={isError ? 'mr-3 select-none text-negative' : 'mr-3 select-none text-neutral-subtle'}
                    >
                      {dateFullFormat(log.timestamp, 'UTC', 'HH:mm:ss')}
                    </span>
                    <Ansi>{message}</Ansi>
                  </div>
                )
              })}
              {errorMessage && (
                <div className="bg-surface-negative-subtle px-5 text-negative">
                  <Ansi>{errorMessage}</Ansi>
                </div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default BlueprintCreationLoadingModal
