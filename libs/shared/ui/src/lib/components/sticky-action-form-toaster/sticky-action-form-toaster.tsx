import { useEffect, useState } from 'react'
import Button from '../button/button'

export interface StickyActionFormToasterProps {
  visible?: boolean
  description?: string
  onReset?: () => void
  resetLabel?: string
  onSubmit?: () => void
  submitLabel?: string
  className?: string
  disabledValidation?: boolean
  loading?: boolean
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
  } = props

  const [visibleState, setVisibleState] = useState(visible)

  useEffect(() => {
    if (visible) {
      setVisibleState(true)
    } else {
      // we want to give the animation the time to play before removing the bloc from the flow with a display none
      setTimeout(() => {
        setVisibleState(false)
      }, 500)
    }
  }, [visible])

  return (
    <div className={`sticky bottom-4 flex justify-center ${className} ${!visibleState ? 'mb-[52px]' : ''}`}>
      <div
        data-testid="sticky-action-form-toaster"
        className={`inline-flex items-center gap-10 rounded bg-neutral-500 p-2 pl-4 text-white shadow-xl ${
          visible ? 'animate-action-bar-fade-in' : 'animate-action-bar-fade-out'
        } ${visibleState ? 'visible' : 'hidden'}`}
      >
        {description && <span className="text-sm font-medium text-white">{description}</span>}
        <div className="flex gap-5">
          {resetLabel && onReset && (
            <button type="button" className="text-ssm font-medium underline" onClick={() => onReset()}>
              {resetLabel}
            </button>
          )}
          {submitLabel && onSubmit && (
            <Button
              color="green"
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
