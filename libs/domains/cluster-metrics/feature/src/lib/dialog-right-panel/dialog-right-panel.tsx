import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'framer-motion'
import { type PropsWithChildren, type ReactNode } from 'react'
import { Button, Icon } from '@qovery/shared/ui'

export interface DialogRightPanelProps extends PropsWithChildren {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  trigger: ReactNode
}

export function DialogRightPanel({ isOpen, onOpenChange, trigger, children }: DialogRightPanelProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>

      <Dialog.Portal>
        <AnimatePresence>
          {isOpen && (
            <>
              <Dialog.Overlay asChild>
                <motion.div
                  className="fixed inset-0 bg-neutral-700/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              </Dialog.Overlay>
              <Dialog.Content asChild>
                <motion.div
                  className="fixed right-0 top-0 h-screen max-h-screen w-[800px] overflow-auto border border-l-0 border-neutral-200 bg-neutral-50"
                  initial={{
                    opacity: 0,
                    x: '100%',
                  }}
                  animate={{
                    opacity: 1,
                    x: '0%',
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    x: '100%',
                  }}
                  transition={{
                    x: { duration: 0.32, type: 'spring', bounce: 0 },
                    ease: [0.39, 0.24, 0.3, 1],
                  }}
                >
                  <div className="absolute right-4 top-4 z-10">
                    <Dialog.Close asChild>
                      <Button variant="outline" size="sm" className="h-8 w-8 justify-center text-sm">
                        <Icon iconName="xmark" />
                      </Button>
                    </Dialog.Close>
                  </div>

                  {children}
                </motion.div>
              </Dialog.Content>
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default DialogRightPanel
