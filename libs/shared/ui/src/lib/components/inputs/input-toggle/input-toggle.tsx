import { type ReactNode, useEffect, useState } from 'react'

export interface InputToggleProps {
  small?: boolean
  value?: boolean
  onChange?: (e: boolean) => void
  title?: string | ReactNode
  description?: string
  className?: string
  dataTestId?: string
  forceAlignTop?: boolean
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
    forceAlignTop = false,
    disabled = false,
    name,
  } = props

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
      className={`flex text-sm  ${description && !forceAlignTop ? 'items-center' : 'items-start'} ${className} ${
        disabled ? 'opacity-50' : ''
      }`}
    >
      <div
        data-testid={props.dataTestId || 'input-toggle-button'}
        aria-label="toggle-btn"
        className={`inline-flex items-center justify-between ${!disabled ? 'cursor-pointer' : ''}`}
        onClick={changeToggle}
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
          className={`${toggleSizeBg} flex items-center rounded-full p-0.5 ${
            animateEnabled ? 'duration-300 ease-in-out' : ''
          } ${
            toggleActive ? `${small ? 'bg-brand-500' : 'bg-brand-500'}` : `${small ? 'bg-neutral-300' : 'bg-gray-300'}`
          }`}
        >
          <div
            aria-label="circle"
            className={`${toggleSizeCircle} transform rounded-full bg-white shadow-lg ${
              animateEnabled ? 'duration-300 ease-in-out' : ''
            } ${toggleActive ? `${small ? 'translate-x-3.5' : 'translate-x-6'}` : ''}`}
          />
        </div>
      </div>
      {title && (
        <div
          onClick={changeToggle}
          className={`${description && forceAlignTop ? 'relative -top-1' : ''} ml-3 ${!disabled ? 'cursor-pointer' : ''} flex flex-col gap-1`}
        >
          {title && <p className="font-medium text-neutral-400">{title}</p>}
          {description && <div className="text-neutral-350">{description}</div>}
        </div>
      )}
    </div>
  )
}

export default InputToggle
