import * as Dialog from '@radix-ui/react-dialog'
import { type ReactNode } from 'react'
import { Icon } from '../icon/icon'

export interface SidePanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  width?: number
  showCloseButton?: boolean
}

export function SidePanel({ open, onOpenChange, children, width = 560, showCloseButton = true }: SidePanelProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-sidepanel-overlay bg-background-overlay data-[state=closed]:animate-sidepanel-overlay-exit data-[state=open]:animate-sidepanel-overlay-enter" />
        <Dialog.Content
          style={{ width }}
          className="fixed right-0 top-0 z-sidepanel h-screen border-l border-neutral bg-background shadow-[0_0_32px_rgba(0,0,0,0.08)] data-[state=closed]:animate-sidepanel-exit data-[state=open]:animate-sidepanel-enter motion-reduce:data-[state=closed]:animate-sidepanel-overlay-exit motion-reduce:data-[state=open]:animate-sidepanel-overlay-enter"
        >
          {showCloseButton && (
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close side panel"
                className="absolute right-4 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-background text-neutral-disabled transition-colors hover:bg-surface-neutral-componentHover hover:text-neutral"
              >
                <Icon iconName="xmark" iconStyle="solid" />
              </button>
            </Dialog.Close>
          )}

          <div className="h-full overflow-auto">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default SidePanel
