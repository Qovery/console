import * as SwitchPrimitive from '@radix-ui/react-switch'
import clsx from 'clsx'
import { type ReactNode, useEffect, useId, useState } from 'react'

export interface InputToggleProps {
  small?: boolean
  value?: boolean
  onChange?: (e: boolean) => void
  title?: string | ReactNode
  description?: string
  className?: string
  dataTestId?: string
  ariaLabel?: string
  align?: 'center' | 'top'
  disabled?: boolean
  name?: string
}

export function InputToggle(props: InputToggleProps) {
  const {
    small,
    value,
    onChange,
    description,
    title,
    className = '',
    align = 'center',
    disabled = false,
    name,
    ariaLabel,
  } = props

  const switchId = useId()
  const [toggleActive, setToggleActive] = useState(Boolean(value))
  const [animateEnabled, setAnimateEnabled] = useState(false)

  useEffect(() => {
    if (value !== undefined) {
      setToggleActive(value)
    }

    // we need to put that in a timeout otherwise the animation classes are added too quickly and the animation is triggered
    const timerId = setTimeout(() => {
      // if value is undefined or null, we don't want to animate
      setAnimateEnabled(value !== undefined && value !== null)
    }, 10)

    return () => clearTimeout(timerId)
  }, [value])

  const toggleSizeBg = small ? 'w-8 h-4.5' : 'w-12 h-6'
  const toggleSizeCircle = small ? 'w-3.5 h-3.5' : 'w-5 h-5'
  const alignmentClass = align === 'top' ? 'items-start' : 'items-center'
  const isChecked = value ?? toggleActive
  const accessibleName = ariaLabel ?? (typeof title === 'string' ? title : 'toggle-btn')

  const changeToggle = (checked: boolean) => {
    if (disabled) return
    // we need to put that in a timeout otherwise the animation classes are added too quickly and the animation is triggered

    setAnimateEnabled(true)
    onChange && onChange(checked)
    setToggleActive(checked)
  }

  return (
    <div
      data-testid="input-toggle"
      className={clsx('flex text-sm', alignmentClass, className, { 'opacity-50': disabled })}
    >
      <SwitchPrimitive.Root
        id={switchId}
        type="button"
        data-testid={props.dataTestId || 'input-toggle-button'}
        aria-label={accessibleName}
        checked={isChecked}
        disabled={disabled}
        name={name}
        value={String(isChecked)}
        className={clsx(
          toggleSizeBg,
          'outline-brand-11 inline-flex shrink-0 items-center rounded-full border-0 p-0.5 outline-0 disabled:pointer-events-none focus-visible:[&:active]:outline-0 focus-visible:[&:not(:active)]:outline-2 focus-visible:[&:not(:active)]:outline-offset-2',
          {
            'cursor-pointer': !disabled,
            'transition-[background-color] duration-300 ease-in-out': animateEnabled,
            'bg-surface-brand-solid': isChecked,
            'bg-surface-neutral-componentActive': !isChecked,
          }
        )}
        onCheckedChange={changeToggle}
      >
        <SwitchPrimitive.Thumb
          aria-label="circle"
          className={`${toggleSizeCircle} block transform rounded-full bg-surface-neutral shadow-lg ${
            animateEnabled ? 'transition-transform duration-300 ease-in-out' : ''
          } ${isChecked ? `${small ? 'translate-x-3.5' : 'translate-x-6'}` : ''}`}
        />
      </SwitchPrimitive.Root>
      {title && (
        <label
          htmlFor={switchId}
          className={`${description && align === 'top' ? 'relative -top-0.5' : ''} ml-3 ${!disabled ? 'cursor-pointer' : ''} flex flex-col gap-1`}
        >
          {title && <p className="font-medium text-neutral">{title}</p>}
          {description && <div className="text-neutral-subtle">{description}</div>}
        </label>
      )}
    </div>
  )
}

export default InputToggle
