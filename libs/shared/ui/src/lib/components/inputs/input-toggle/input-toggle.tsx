import clsx from 'clsx'
import { type ReactNode, useEffect, useState } from 'react'

export interface InputToggleProps {
  small?: boolean
  value?: boolean
  onChange?: (e: boolean) => void
  title?: string | ReactNode
  description?: string
  className?: string
  dataTestId?: string
  align?: 'center' | 'top'
  disabled?: boolean
  name?: string
}

export function InputToggle(props: InputToggleProps) {
  const { small, value, onChange, description, title, className = '', align = 'center', disabled = false, name } = props

  const [toggleActive, setToggleActive] = useState(value)
  const [animateEnabled, setAnimateEnabled] = useState(false)

  useEffect(() => {
    setToggleActive(value)

    // we need to put that in a timeout otherwise the animation classes are added too quickly and the animation is triggered
    setTimeout(() => {
      // if value is undefined or null, we don't want to animate
      setAnimateEnabled(value !== undefined && value !== null)
    }, 10)
  }, [value])

  const toggleSizeBg = small ? 'w-8 h-4.5' : 'w-12 h-6'
  const toggleSizeCircle = small ? 'w-3.5 h-3.5' : 'w-5 h-5'
  const alignmentClass = align === 'top' ? 'items-start' : 'items-center'

  const changeToggle = () => {
    if (disabled) return
    // we need to put that in a timeout otherwise the animation classes are added too quickly and the animation is triggered

    setAnimateEnabled(true)
    onChange && onChange(!toggleActive)
    setToggleActive(!toggleActive)
  }

  return (
    <div
      data-testid="input-toggle"
      className={clsx('flex text-sm', alignmentClass, className, { 'opacity-50': disabled })}
    >
      <div
        data-testid={props.dataTestId || 'input-toggle-button'}
        aria-label="toggle-btn"
        role="switch"
        aria-checked={Boolean(toggleActive)}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        className={clsx(
          'inline-flex items-center justify-between rounded-full outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-11',
          { 'cursor-pointer': !disabled }
        )}
        onClick={changeToggle}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            changeToggle()
          }
        }}
      >
        <input
          type="checkbox"
          defaultChecked={toggleActive}
          defaultValue={toggleActive?.toString()}
          className="hidden"
          disabled={disabled}
          name={name}
        />
        <div
          aria-label="bg"
          className={clsx(toggleSizeBg, 'flex items-center rounded-full p-0.5', {
            'duration-300 ease-in-out': animateEnabled,
            'bg-surface-brand-solid': toggleActive,
            'bg-surface-neutral-componentActive': !toggleActive,
          })}
        >
          <div
            aria-label="circle"
            className={`${toggleSizeCircle} transform rounded-full bg-surface-neutral shadow-lg ${
              animateEnabled ? 'duration-300 ease-in-out' : ''
            } ${toggleActive ? `${small ? 'translate-x-3.5' : 'translate-x-6'}` : ''}`}
          />
        </div>
      </div>
      {title && (
        <div
          onClick={changeToggle}
          className={`${description && align === 'top' ? 'relative -top-0.5' : ''} ml-3 ${!disabled ? 'cursor-pointer' : ''} flex flex-col gap-1`}
        >
          {title && <p className="font-medium text-neutral">{title}</p>}
          {description && <div className="text-neutral-subtle">{description}</div>}
        </div>
      )}
    </div>
  )
}

export default InputToggle
