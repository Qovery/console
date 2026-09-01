import { useEffect, useState } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import Button, { type ButtonProps } from '../button/button'

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

  const [shouldRender, setShouldRender] = useState(visible)

  useEffect(() => {
    if (visible) {
      setShouldRender(true)
    }
  }, [visible])

  const submitButtonColorValue = submitButtonColor ?? 'green'

  if (!shouldRender) return null

  return (
    <div
      className={twMerge(
        'z-toast flex justify-center',
        fixed ? 'fixed inset-x-0 bottom-14' : 'sticky bottom-4',
        !visible && 'pointer-events-none',
        className
      )}
      aria-hidden={!visible}
    >
      <div
        data-testid="sticky-action-form-toaster"
        className={twMerge(
          'inline-flex items-center gap-10 rounded-md border border-neutral bg-surface-neutralInvert-component p-2 pl-4 text-neutralInvert shadow-xl',
          visible ? 'animate-action-bar-fade-in' : 'animate-action-bar-fade-out'
        )}
        onAnimationEnd={(event) => {
          if (!visible && event.currentTarget === event.target) {
            setShouldRender(false)
          }
        }}
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
      </div>
    </div>
  )
}

export default StickyActionFormToaster
