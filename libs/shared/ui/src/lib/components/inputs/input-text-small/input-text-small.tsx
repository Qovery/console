import clsx from 'clsx'
import { type ChangeEventHandler, useEffect, useState } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import Icon from '../../icon/icon'
import { IconAwesomeEnum } from '../../icon/icon-awesome.enum'
import Tooltip from '../../tooltip/tooltip'

export interface InputTextSmallProps {
  name: string
  type?: string
  onChange?: ChangeEventHandler<HTMLInputElement>
  value?: string
  placeholder?: string
  error?: string
  warning?: string
  className?: string
  classNameInput?: string
  label?: string
  dataTestId?: string
  errorMessagePosition?: 'left' | 'bottom'
  hasShowPasswordButton?: boolean
  disabled?: boolean
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
    classNameInput = '',
    errorMessagePosition = 'bottom',
    hasShowPasswordButton = false,
    disabled = false,
    label,
    dataTestId = 'input-value',
  } = props

  const [focused, setFocused] = useState(false)
  const [currentType, setCurrentType] = useState(type)

  const hasError = error && error.length > 0 ? 'input--error' : ''
  const hasFocus = focused ? 'input--focused' : ''
  const hasDisabled = disabled ? 'input--disabled' : ''

  const classNameError = errorMessagePosition === 'left' ? 'flex gap-3 items-center' : ''

  useEffect(() => {
    setCurrentType(type)
  }, [type])

  return (
    <div data-testid="input-small-wrapper" className={`${className} ${classNameError}`}>
      {(error || warning) && errorMessagePosition === 'left' && (
        <Tooltip content={error || warning || ''} align="center" side="top">
          <div data-testid="warning-icon-left" className="flex items-center">
            <Icon iconName="triangle-exclamation" className="block text-sm text-yellow-500" />
          </div>
        </Tooltip>
      )}
      <div data-testid="input" className={`input input--small flex-grow ${hasError} ${hasFocus} ${hasDisabled}`}>
        <label className="hidden" htmlFor={label}>
          {label}
        </label>
        <input
          className={twMerge(
            clsx(
              'absolute left-0 top-0 h-full w-full rounded px-2 text-sm text-neutral-400 placeholder:text-neutral-350',
              {
                'pr-8': hasShowPasswordButton,
              },
              classNameInput
            )
          )}
          name={name}
          type={currentType}
          placeholder={placeholder}
          value={value}
          onInput={onChange}
          disabled={disabled}
          id={label}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          data-testid={dataTestId}
        />
        {hasShowPasswordButton && (
          <div
            data-testid="show-password-button"
            onClick={() => setCurrentType(currentType === 'password' ? 'text' : 'password')}
            className="absolute right-2 -translate-y-0.5 transform text-sm text-neutral-400"
          >
            <Icon name={currentType === 'password' ? IconAwesomeEnum.EYE : IconAwesomeEnum.EYE_SLASH} />
          </div>
        )}
      </div>
      {error && errorMessagePosition === 'bottom' && (
        <p className="mt-1 px-4 text-xs font-medium text-red-500">{error}</p>
      )}
    </div>
  )
}

export default InputTextSmall
