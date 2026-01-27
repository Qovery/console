import { type ReactNode, useEffect, useState } from 'react'
import { Checkbox } from '../checkbox/checkbox'

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
    ? 'bg-surface-brand-subtle border border-brand-strong'
    : ' bg-surface-neutral-subtle border-neutral'

  return (
    <div
      data-testid={dataTestId}
      className={`cursor-pointer rounded border p-4 transition-all ${checkedClasses} ${className}`}
      onClick={() => !currentChecked && setCurrentChecked(true)}
    >
      <div>
        <div className="mb-1 flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            id={name}
            name={name}
            checked={currentChecked ?? false}
            onCheckedChange={(checked) => setCurrentChecked(checked as boolean)}
          />
          <label htmlFor={name} className="cursor-pointer select-none text-sm font-medium text-neutral">
            {title}
          </label>
        </div>
        {description && <p className="ml-8 text-sm text-neutral">{description}</p>}
      </div>

      {currentChecked && <div onClick={(e) => e.stopPropagation()}>{children}</div>}
    </div>
  )
}

export default EnableBox
