import clsx from 'clsx'
import {
  type ChangeEventHandler,
  type FocusEventHandler,
  type KeyboardEventHandler,
  forwardRef,
  useEffect,
  useState,
} from 'react'
import { twMerge } from '@qovery/shared/util-js'
import Icon from '../../icon/icon'
import { IconAwesomeEnum } from '../../icon/icon-awesome.enum'
import Tooltip from '../../tooltip/tooltip'

export interface InputTextSmallProps {
  name: string
  type?: string
  onChange?: ChangeEventHandler<HTMLInputElement>
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>
  onBlur?: FocusEventHandler<HTMLInputElement>
  value?: string
  placeholder?: string
  error?: string
  warning?: string
  className?: string
  inputClassName?: string
  label?: string
  dataTestId?: string
  errorMessagePosition?: 'left' | 'bottom'
  hasShowPasswordButton?: boolean
  disabled?: boolean
  spellCheck?: boolean
}

export const InputTextSmall = forwardRef<HTMLInputElement, InputTextSmallProps>(function InputTextSmall(
  props: InputTextSmallProps,
  ref
) {
  const {
    name,
    value,
    placeholder,
    error,
    warning,
    onChange,
    onKeyDown,
    onBlur,
    type = 'text',
    className = '',
    inputClassName = '',
    errorMessagePosition = 'bottom',
    hasShowPasswordButton = false,
    disabled = false,
    label,
    dataTestId = 'input-value',
    spellCheck = false,
  } = props

  const [focused, setFocused] = useState(false)
  const [currentType, setCurrentType] = useState(type)

  useEffect(() => {
    setCurrentType(type)
  }, [type])

  return (
    <div
      data-testid="input-small-wrapper"
      className={twMerge(
        clsx(className, {
          'flex items-center gap-3': errorMessagePosition === 'left',
        })
      )}
    >
      {(error || warning) && errorMessagePosition === 'left' && (
        <Tooltip content={error || warning || ''} align="center" side="top">
          <div data-testid="warning-icon-left" className="flex items-center">
            <Icon iconName="triangle-exclamation" className="block text-sm text-warning" />
          </div>
        </Tooltip>
      )}
      <div
        data-testid="input"
        className={clsx('input input--small flex-grow', {
          'input--error': error && error.length > 0,
          'input--focused': focused,
          'input--disabled': disabled,
        })}
      >
        <label className="hidden" htmlFor={label}>
          {label}
        </label>
        <input
          className={twMerge(
            clsx(
              'absolute left-0 top-0 h-full w-full rounded bg-transparent px-2 text-sm text-neutral placeholder:text-neutral-subtle',
              {
                'pr-8': hasShowPasswordButton,
              }
            ),
            inputClassName
          )}
          ref={ref}
          name={name}
          type={currentType}
          placeholder={placeholder}
          value={value}
          onInput={onChange}
          disabled={disabled}
          id={label}
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            setFocused(false)
            onBlur?.(e)
          }}
          data-testid={dataTestId}
          onKeyDown={onKeyDown}
          spellCheck={spellCheck}
        />
        {hasShowPasswordButton && (
          <div
            data-testid="show-password-button"
            onClick={() => setCurrentType(currentType === 'password' ? 'text' : 'password')}
            className="absolute right-2 -translate-y-[0.5px] transform text-sm text-neutral-subtle hover:text-neutral"
          >
            <Icon name={currentType === 'password' ? IconAwesomeEnum.EYE : IconAwesomeEnum.EYE_SLASH} />
          </div>
        )}
      </div>
      {error && errorMessagePosition === 'bottom' && (
        <p className="mt-1 px-4 text-xs font-medium text-negative">{error}</p>
      )}
    </div>
  )
})

export default InputTextSmall
