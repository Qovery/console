import { useEffect, useState } from 'react'
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
  warning?: string
  className?: string
  label?: string
  errorMessagePosition?: 'left' | 'bottom'
  hasShowPasswordButton?: boolean
}

export function InputTextSmall(props: InputTextSmallProps) {
  const {
    name,
    value,
    placeholder,
    error,
    warning,
    onChange,
    type = 'text',
    className = '',
    errorMessagePosition = 'bottom',
    hasShowPasswordButton = false,
  } = props

  const [focused, setFocused] = useState(false)
  const [currentType, setCurrentType] = useState(type)

  const hasError = error && error.length > 0 ? 'input--error' : ''
  const hasFocus = focused ? 'input--focused' : ''

  const classNameError = errorMessagePosition === 'left' ? 'flex gap-3 items-center' : ''

  useEffect(() => {
    setCurrentType(type)
  }, [type])

  return (
    <div data-testid="input-small-wrapper" className={`${className} ${classNameError}`}>
      {(error || warning) && errorMessagePosition === 'left' && (
        <Tooltip content={error || warning || ''} align="center" side="top">
          <div data-testid="warning-icon-left" className="flex item-center">
            <Icon name={IconAwesomeEnum.TRIANGLE_EXCLAMATION} className="block text-warning-500 text-sm" />
          </div>
        </Tooltip>
      )}
      <div data-testid="input" className={`input input--small flex-grow ${hasError} ${hasFocus}`}>
        <label className="hidden" htmlFor={props.label}>
          {props.label}
        </label>
        <input
          className={`absolute text-sm top-0 left-0 h-full w-full text-text-600 placeholder:text-text-400 rounded px-2 ${
            hasShowPasswordButton ? 'pr-8' : ''
          }`}
          name={name}
          type={currentType}
          placeholder={placeholder}
          value={value}
          onInput={onChange}
          id={props.label}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {hasShowPasswordButton && (
          <div
            data-testid="show-password-button"
            onClick={() => setCurrentType(currentType === 'password' ? 'text' : 'password')}
            className="text-sm text-text-500 absolute right-2 transform -translate-y-0.5"
          >
            <Icon name={currentType === 'password' ? IconAwesomeEnum.EYE : IconAwesomeEnum.EYE_SLASH} />
          </div>
        )}
      </div>
      {error && errorMessagePosition === 'bottom' && (
        <p className="px-4 mt-1 font-medium text-xs text-error-500">{error}</p>
      )}
    </div>
  )
}

export default InputTextSmall
