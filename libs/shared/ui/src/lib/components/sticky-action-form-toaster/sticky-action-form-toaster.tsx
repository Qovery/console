import { useEffect, useState } from 'react'
import Button, { ButtonStyle } from '../buttons/button/button'

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
        data-testid={'sticky-action-form-toaster'}
        className={`rounded bg-element-light-darker-100 shadow-xl text-white inline-flex items-center pl-4 p-2 gap-10 ${
          visible ? 'animate-action-bar-fade-in' : 'animate-action-bar-fade-out'
        } ${visibleState ? 'visible' : 'hidden'}`}
      >
        {description && <span className="font-medium text-white text-sm">{description}</span>}
        <div className="flex gap-5">
          {resetLabel && onReset && (
            <button type="button" className="text-ssm underline font-medium" onClick={() => onReset()}>
              {resetLabel}
            </button>
          )}
          {submitLabel && onSubmit && (
            <Button
              style={ButtonStyle.CONFIRM}
              onClick={() => onSubmit()}
              disabled={props.disabledValidation}
              dataTestId="submit-button"
              loading={props.loading}
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
