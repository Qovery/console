import * as Dialog from '@radix-ui/react-dialog'
import { type EnvironmentLogs } from 'qovery-typescript-axios'
import { LogsType } from '@qovery/shared/enums'
import { Ansi, Button, Heading, Icon, Skeleton } from '@qovery/shared/ui'
import { dateFullFormat } from '@qovery/shared/util-dates'

export interface BlueprintCreationLoadingModalProps {
  logs: EnvironmentLogs[]
  onEditConfig: () => void
  onRetry: () => void
  open: boolean
  serviceName: string
}

export function BlueprintCreationLoadingModal({
  logs,
  onEditConfig,
  onRetry,
  open,
  serviceName,
}: BlueprintCreationLoadingModalProps) {
  const hasError = logs.some((log) => log.type === LogsType.ERROR)

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
                <Button type="button" size="md" onClick={onRetry}>
                  <Icon iconName="arrow-rotate-right" iconStyle="regular" />
                  Retry
                </Button>
              </div>
            )}
            <Dialog.Description id="blueprint-creation-loading-description" className="sr-only">
              Blueprint service creation logs.
            </Dialog.Description>
          </div>

          <div
            className="min-h-0 flex-1 overflow-auto bg-surface-neutral-subtle py-3 font-code text-xs leading-5 text-neutral"
            role="log"
          >
            {logs.length === 0 ? (
              <BlueprintCreationLogsSkeleton />
            ) : (
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
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function BlueprintCreationLogsSkeleton() {
  const lineWidths = ['64%', '48%', '72%', '56%', '68%', '42%', '76%', '52%', '62%', '44%', '70%', '58%']

  return (
    <div aria-label="Waiting for creation logs" className="flex flex-col gap-3 px-5 py-1">
      {lineWidths.map((width, index) => (
        <div key={`${width}-${index}`} className="flex items-center gap-3">
          <Skeleton width={56} height={12} />
          <Skeleton width={width} height={12} />
        </div>
      ))}
    </div>
  )
}

export default BlueprintCreationLoadingModal
