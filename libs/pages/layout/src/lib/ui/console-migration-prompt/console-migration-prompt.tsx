import { AnimatePresence, motion } from 'framer-motion'
import { Button, Icon } from '@qovery/shared/ui'

export interface ConsoleMigrationPromptProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export function ConsoleMigrationPrompt({ open, onClose, onConfirm }: ConsoleMigrationPromptProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed bottom-[18px] left-[calc(50%+2rem)] max-w-content-with-navigation-left -translate-x-1/2">
          <motion.aside
            key="console-migration-prompt"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{
              animate: { duration: 0.12, ease: 'easeOut', delay: 2 },
              exit: { duration: 0.12, ease: 'easeOut' },
            }}
          >
            <div className="overflow-hidden rounded-full border border-neutral-200 bg-white/95 shadow-[0_16px_48px_rgba(16,30,54,0.14)] backdrop-blur">
              <div className="flex h-10 items-center justify-center gap-2 bg-gradient-to-r from-brand-500/10 via-sky-400/10 to-brand-500/5 px-4 pl-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-500">
                  <Icon iconName="gift" className="text-xs" />
                </div>
                <p className="max-w-[32rem] truncate text-center text-ssm text-neutral-400">
                  Switch to the new console and redirect future visits automatically.
                </p>
                <div className="flex shrink-0 items-center gap-2">
                  <Button type="button" size="sm" color="brand" onClick={onConfirm}>
                    Try now
                  </Button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-4 w-4 items-center justify-center text-neutral-400 transition-colors hover:text-neutral-350"
                  >
                    <Icon iconName="xmark" iconStyle="regular" />
                  </button>
                </div>
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}

export default ConsoleMigrationPrompt
