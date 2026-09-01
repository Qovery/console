import { AnimatePresence, type MotionProps, motion, useReducedMotion } from 'framer-motion'
import { twMerge } from '@qovery/shared/util-js'
import Button, { type ButtonProps } from '../button/button'

const TOASTER_MOTION = {
  initial: { opacity: 0.5, y: '50%', scale: 0.6 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    pointerEvents: 'auto',
    transition: { duration: 0.35, ease: [0.165, 0.84, 0.44, 1] },
  },
  exit: {
    opacity: 0,
    y: '50%',
    scale: 0.8,
    pointerEvents: 'none',
    transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] },
  },
} satisfies Pick<MotionProps, 'initial' | 'animate' | 'exit'>

const REDUCED_TOASTER_MOTION = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    pointerEvents: 'auto',
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    pointerEvents: 'none',
    transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] },
  },
} satisfies Pick<MotionProps, 'initial' | 'animate' | 'exit'>

export interface StickyActionFormToasterProps {
  visible?: boolean
  description?: string
  onReset?: () => void
  resetLabel?: string
  onSubmit?: () => void
  submitLabel?: string
  submitButtonColor?: ButtonProps['color']
  className?: string
  disabledValidation?: boolean
  loading?: boolean
  fixed?: boolean
}

export function StickyActionFormToaster(props: StickyActionFormToasterProps) {
  const {
    description = 'Warning, there are still unsaved changes!',
    onReset,
    resetLabel = 'Reset',
    submitLabel = 'Save modifications',
    onSubmit,
    className = '',
    visible = false,
    submitButtonColor,
    fixed = false,
  } = props
  const reducedMotion = useReducedMotion()

  const submitButtonColorValue = submitButtonColor ?? 'green'

  return (
    <AnimatePresence>
      {visible ? (
        <div
          key="sticky-action-form-toaster"
          className={twMerge(
            'z-toast flex justify-center',
            fixed ? 'fixed inset-x-0 bottom-14' : 'sticky bottom-4',
            className
          )}
        >
          <motion.div
            data-testid="sticky-action-form-toaster"
            className="inline-flex items-center gap-10 rounded-md border border-neutral bg-surface-neutralInvert-component p-2 pl-4 text-neutralInvert shadow-xl"
            {...(reducedMotion ? REDUCED_TOASTER_MOTION : TOASTER_MOTION)}
          >
            {description && <span className="text-sm font-medium text-neutralInvert">{description}</span>}
            <div className="flex gap-5">
              {resetLabel && onReset && (
                <button type="button" className="text-ssm font-medium underline" onClick={() => onReset()}>
                  {resetLabel}
                </button>
              )}
              {submitLabel && onSubmit && (
                <Button
                  color={submitButtonColorValue}
                  size="md"
                  data-testid="submit-button"
                  onClick={() => onSubmit()}
                  loading={props.loading}
                  disabled={props.disabledValidation}
                  type="button"
                >
                  {submitLabel}
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}

export default StickyActionFormToaster
