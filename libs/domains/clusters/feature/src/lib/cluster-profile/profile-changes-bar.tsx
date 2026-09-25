import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Button, Icon } from '@qovery/shared/ui'
import { pluralize } from '@qovery/shared/util-js'

interface ProfileChangesBarProps {
  changeCount: number
  isSaving: boolean
  isDeploying: boolean
  onReset: () => void
  onSave: () => void
  onSaveAndDeploy: () => void
}

export function ProfileChangesBar({
  changeCount,
  isSaving,
  isDeploying,
  onReset,
  onSave,
  onSaveAndDeploy,
}: ProfileChangesBarProps) {
  const reducedMotion = useReducedMotion()
  const isPending = isSaving || isDeploying

  return (
    <AnimatePresence>
      {changeCount > 0 ? (
        <motion.div
          key="profile-changes-bar"
          role="region"
          aria-label="Unsaved profile changes"
          className="pointer-events-auto flex w-full max-w-[544px] items-center justify-between gap-4 rounded-lg border border-neutral bg-surface-neutral py-3 pl-4 pr-3 shadow-[0_2px_2px_-1px_rgba(27,36,44,0.04),0_16px_24px_-6px_rgba(27,36,44,0.16)]"
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <p className="text-sm text-neutral">
            {changeCount} {pluralize(changeCount, 'change')} ongoing
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="text-ssm font-medium text-neutral-subtle underline hover:text-neutral disabled:cursor-not-allowed disabled:text-neutral-disabled"
              disabled={isPending}
              onClick={onReset}
            >
              Reset
            </button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="solid"
                color="neutral"
                size="md"
                className="gap-1.5"
                loading={isSaving}
                disabled={isDeploying}
                onClick={onSave}
              >
                <Icon iconName="floppy-disk" iconStyle="regular" />
                Save
              </Button>
              <Button
                type="button"
                variant="outline"
                color="neutral"
                size="md"
                className="gap-1.5"
                loading={isDeploying}
                disabled={isSaving}
                onClick={onSaveAndDeploy}
              >
                <Icon iconName="rocket" iconStyle="regular" />
                Save and deploy
              </Button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
