import { FormEvent, ReactNode, useEffect, useState } from 'react'
import { InputCheckbox } from '@qovery/shared/ui'

export interface EnableBoxProps {
  checked: boolean
  children: ReactNode
  setChecked: (checked: boolean) => void
  title: string
  description: string
  className?: string
  name?: string
}

export function EnableBox(props: EnableBoxProps) {
  const { checked, children, setChecked, title, description, className = '', name = 'checkbox' } = props

  const [currentChecked, setCurrentChecked] = useState(checked)

  useEffect(() => {
    setCurrentChecked(checked)
  }, [checked])

  useEffect(() => {
    setChecked(currentChecked)
  }, [currentChecked, setChecked])

  const checkedClasses = currentChecked
    ? 'bg-brand-50 border border-brand-500'
    : ' bg-element-light-lighter-200  border-element-light-lighter-500'

  return (
    <div className={`p-4 border transition-all rounded ${checkedClasses} ${className}`}>
      <InputCheckbox
        className="mb-1"
        onChange={(e) => setCurrentChecked((e as FormEvent<HTMLInputElement>).currentTarget.checked)}
        name={name}
        label={title}
        value={name}
        isChecked={checked}
        big
      />
      {description && <p className="ml-8 text-text-500 text-sm">{description}</p>}

      {currentChecked && children}
    </div>
  )
}

export default EnableBox
