import * as Dialog from '@radix-ui/react-dialog'
import { Button, Icon, LoaderSpinner } from '@qovery/shared/ui'

export type BlueprintUpdateModalState = 'loading' | 'error'

export interface BlueprintUpdateLoadingModalProps {
  errorMessage?: string
  onEditConfig: () => void
  onRetry: () => void
  open: boolean
  serviceName: string
  state: BlueprintUpdateModalState
}

const creationLogs = [
  ['00:00:00', 'Initializing service modules...'],
  ['00:12:34', 'Loading configuration files...'],
  ['00:15:47', 'Establishing database connections...'],
  ['00:18:22', 'Fetching user data...'],
  ['00:20:10', 'Processing request queue...'],
  ['00:22:55', 'Updating cache entries...'],
  ['00:25:03', 'Synchronizing with external API...'],
  ['00:27:41', 'Validating input parameters...'],
  ['00:30:18', 'Executing scheduled tasks...'],
  ['00:33:29', 'Committing transaction logs...'],
  ['00:35:50', 'Cleaning up temporary files...'],
  ['00:38:12', 'Restarting background workers...'],
  ['00:40:45', 'Monitoring system health...'],
]

export function BlueprintUpdateLoadingModal({
  errorMessage,
  onEditConfig,
  onRetry,
  open,
  serviceName,
  state,
}: BlueprintUpdateLoadingModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={() => undefined}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-overlay bg-background-overlay" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-modal h-[480px] w-[680px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-md border border-neutral bg-background shadow-[0_0_32px_rgba(0,0,0,0.08)] focus:outline-none"
          onEscapeKeyDown={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
        >
          <div className="flex items-center justify-between p-5">
            <Dialog.Title className="text-2xl font-medium leading-8 text-neutral">
              Creating <span className="text-neutral-subtle">{serviceName}</span>
            </Dialog.Title>
            <Dialog.Description className="sr-only">Blueprint update status</Dialog.Description>
            {state === 'error' ? (
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" color="neutral" size="md" onClick={onEditConfig}>
                  <Icon iconName="pen" iconStyle="regular" />
                  Edit config
                </Button>
                <Button type="button" variant="solid" color="brand" size="md" onClick={onRetry}>
                  <Icon iconName="rotate-right" />
                  Retry
                </Button>
              </div>
            ) : (
              <LoaderSpinner className="h-6 w-6 shrink-0" />
            )}
          </div>
          <div
            aria-busy={state === 'loading'}
            aria-label="Blueprint update logs"
            className="h-[439px] overflow-auto border-t border-neutral bg-surface-neutral-subtle py-2 font-mono text-xs leading-5"
          >
            {creationLogs.map(([timestamp, message]) => (
              <div key={timestamp} className="flex h-6 items-center gap-4 px-5">
                <span className="shrink-0 text-neutral-subtle">{timestamp}</span>
                <span className="text-neutral">{message}</span>
              </div>
            ))}
            {state === 'error' && (
              <div className="flex h-6 items-center gap-4 bg-surface-negative-subtle px-5 text-negative">
                <span className="shrink-0">00:43:07</span>
                <span>{errorMessage ?? 'Unable to update the blueprint.'}</span>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
