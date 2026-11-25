import * as Dialog from '@radix-ui/react-dialog'
import { Button, Icon, Sheet } from '@qovery/shared/ui'
import { TokenBudgetView } from '../token-budget/token-budget-view'
import { computeTokenBudget } from '../utils/token-budget'

export function PresetPreviewPanel({
  preset,
  open,
  onOpenChange,
  draft = false,
}: {
  preset: Parameters<typeof computeTokenBudget>[0] & { name?: string }
  open: boolean
  onOpenChange: (open: boolean) => void
  draft?: boolean
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-overlay bg-background-overlay" />
        <Dialog.Content asChild>
          <Sheet className="fixed bottom-0 right-0 top-0 z-modal w-[520px] max-w-[calc(100vw-24px)] shadow-none">
            <header className="flex shrink-0 items-start justify-between gap-4 border-b border-neutral px-5 pb-4 pt-5">
              <div className="flex min-w-0 flex-col gap-1">
                <Dialog.Title className="text-xl font-medium leading-7 text-neutral">
                  Preview: {preset.name || 'Untitled preset'}
                </Dialog.Title>
                <Dialog.Description className="max-w-[440px] text-sm leading-5 text-neutral-subtle">
                  {draft
                    ? 'Preview of your current draft, including unsaved changes.'
                    : 'Skills and estimated context size for this preset.'}
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <Button type="button" size="xs" variant="plain" color="neutral" iconOnly aria-label="Close preview">
                  <Icon iconName="xmark" />
                </Button>
              </Dialog.Close>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              <TokenBudgetView budget={computeTokenBudget(preset)} />
            </div>
          </Sheet>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
