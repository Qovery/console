import Icon from '../../icon/icon'
import { IconAwesomeEnum } from '../../icon/icon-awesome.enum'
import Tooltip from '../../tooltip/tooltip'

export interface InputTextSmallProps {
  name: string
  type?: string
  onChange?: () => void
  value?: string
  placeholder?: string
  error?: string
  className?: string
  label?: string
  errorMessagePosition?: 'left' | 'bottom'
}

export function InputTextSmall(props: InputTextSmallProps) {
  const {
    name,
    value,
    placeholder,
    error,
    onChange,
    type = 'text',
    className = '',
    errorMessagePosition = 'bottom',
  } = props

  const hasError = error && error.length > 0 ? 'input--error' : ''
  const hasValue = value && value.length > 0 ? 'input--focused' : ''

  const classNameError = errorMessagePosition === 'left' ? 'flex gap-2 items-center' : ''

  return (
    <div data-testid="input-small-wrapper" className={`${className} ${classNameError}`}>
      {error && errorMessagePosition === 'left' && (
        <Tooltip content={error} align="center">
          <div data-testid="warning-icon-left" className="flex item-center">
            <Icon name={IconAwesomeEnum.TRIANGLE_EXCLAMATION} className="block text-warning-500 text-md" />
          </div>
        </Tooltip>
      )}
      <div data-testid="input" className={`input input--small flex-grow ${hasError} ${hasValue}`}>
        <label className="hidden" htmlFor={props.label}>
          {props.label}
        </label>
        <input
          className="absolute text-sm top-0 left-0 h-full w-full text-text-600 placeholder:text-text-400 rounded px-4"
          name={name}
          type={type}
          placeholder={placeholder}
          defaultValue={value}
          onChange={onChange}
          id={props.label}
        />
      </div>
      {error && errorMessagePosition === 'bottom' && (
        <p className="px-4 mt-1 font-medium text-xs text-error-500">{error}</p>
      )}
    </div>
  )
}

export default InputTextSmall
