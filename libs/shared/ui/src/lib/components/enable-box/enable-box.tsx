import { FormEvent, ReactNode, useEffect, useState } from 'react'
import InputCheckbox from '../inputs/input-checkbox/input-checkbox'

export interface EnableBoxProps {
  checked: boolean | undefined
  children: ReactNode
  setChecked: (checked: boolean | undefined) => void
  title: string
  description: string
  className?: string
  name?: string
  dataTestId?: string
}

export function EnableBox(props: EnableBoxProps) {
  const {
    checked,
    children,
    setChecked,
    title,
    description,
    className = '',
    name = 'checkbox',
    dataTestId = 'enabled-box',
  } = props

  const [currentChecked, setCurrentChecked] = useState(checked)

  useEffect(() => {
    if (checked !== undefined) setCurrentChecked(checked)
  }, [checked])

  useEffect(() => {
    if (currentChecked !== checked) setChecked(currentChecked)
  }, [currentChecked, setChecked, checked])

  const checkedClasses = currentChecked
    ? 'bg-brand-50 border border-brand-500'
    : ' bg-element-light-lighter-200  border-element-light-lighter-500'

  return (
    <div
      data-testid={dataTestId}
      className={`p-4 border transition-all rounded ${checkedClasses} ${className}`}
      onClick={() => {
        if (!currentChecked) setCurrentChecked(!currentChecked)
      }}
    >
      <InputCheckbox
        className="mb-1"
        onChange={(e) => setCurrentChecked((e as FormEvent<HTMLInputElement>).currentTarget.checked)}
        name={name}
        label={title}
        value={name}
        isChecked={currentChecked}
        big
      />
      {description && <p className="ml-8 text-text-500 text-sm">{description}</p>}

      {currentChecked && children}
    </div>
  )
}

export default EnableBox
