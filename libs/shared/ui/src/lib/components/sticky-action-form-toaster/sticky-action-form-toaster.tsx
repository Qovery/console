import Button, { ButtonStyle } from '../buttons/button/button'

export interface StickyActionFormToasterProps {
  description?: string
  onReset?: () => void
  resetLabel?: string
  onSubmit?: () => void
  submitLabel?: string
  className?: string
}

export function StickyActionFormToaster(props: StickyActionFormToasterProps) {
  const {
    description = 'Warning, there are still unsaved changes!',
    onReset,
    resetLabel = 'Reset',
    submitLabel = 'Save modifications',
    onSubmit,
    className = '',
  } = props
  return (
    <div
      className={`rounded bg-element-light-darker-100 shadow-xl text-white ${className} inline-flex items-center pl-4 p-2 gap-10`}
    >
      {description && <span className="font-medium text-white text-sm">{description}</span>}
      <div className="flex gap-5">
        {resetLabel && onReset && (
          <button type="button" className="text-ssm underline font-medium" onClick={() => onReset()}>
            {resetLabel}
          </button>
        )}
        {submitLabel && onSubmit && (
          <Button style={ButtonStyle.CONFIRM} className="" onClick={() => onSubmit()}>
            {submitLabel}
          </Button>
        )}
      </div>
    </div>
  )
}

export default StickyActionFormToaster
