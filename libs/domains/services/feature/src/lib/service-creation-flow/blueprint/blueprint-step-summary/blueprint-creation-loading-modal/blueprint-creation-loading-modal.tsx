import * as Dialog from '@radix-ui/react-dialog'
import { type EnvironmentLogs } from 'qovery-typescript-axios'
import { LogsType } from '@qovery/shared/enums'
import { Ansi, Heading, LoaderSpinner, Section } from '@qovery/shared/ui'
import { dateFullFormat } from '@qovery/shared/util-dates'

export interface BlueprintCreationLoadingModalProps {
  logs: EnvironmentLogs[]
  open: boolean
  serviceName: string
}

export function BlueprintCreationLoadingModal({ logs, open, serviceName }: BlueprintCreationLoadingModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={() => undefined}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-overlay bg-background-overlay" />
        <Dialog.Content
          aria-describedby="blueprint-creation-loading-description"
          className="fixed left-1/2 top-1/2 z-overlay flex h-[480px] w-[680px] max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-neutral bg-surface-neutral shadow-lg focus:outline-none"
          onEscapeKeyDown={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
        >
          <Section className="shrink-0 gap-1 border-b border-neutral px-5 py-4">
            <Dialog.Title asChild>
              <Heading level={3}>Creating {serviceName}</Heading>
            </Dialog.Title>
            <Dialog.Description id="blueprint-creation-loading-description" className="text-sm text-neutral-subtle">
              Your blueprint service is being created. Creation logs will appear below.
            </Dialog.Description>
          </Section>

          <div className="min-h-0 flex-1 overflow-auto px-5 py-4 font-code text-xs leading-5 text-neutral" role="log">
            {logs.length > 0 ? (
              <div className="flex flex-col gap-1">
                {logs.map((log) => {
                  const isError = log.type === LogsType.ERROR
                  const message = isError ? log.error?.user_log_message : log.message?.safe_message

                  return (
                    <div key={log.timestamp} className={isError ? 'text-negative' : 'text-neutral'}>
                      <span className="mr-3 select-none text-neutral-subtle">
                        {dateFullFormat(log.timestamp, 'UTC', 'HH:mm:ss')}
                      </span>
                      <Ansi>{message}</Ansi>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center gap-2 font-sans text-sm text-neutral-subtle">
                <LoaderSpinner />
                <span>Waiting for creation logs</span>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default BlueprintCreationLoadingModal
