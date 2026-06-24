import { type ReactNode } from 'react'
import { Checkbox } from '@qovery/shared/ui'

export interface CheckboxFieldProps {
  autoFocus?: boolean
  checked: boolean
  children?: ReactNode
  description: string
  label: string
  name: string
  onChange: (checked: boolean) => void
}

export function CheckboxField({ autoFocus, checked, children, description, label, name, onChange }: CheckboxFieldProps) {
  return (
    <div className="rounded-md border border-neutral bg-surface-neutral px-3 py-3">
      <div className="flex items-center gap-2">
        <Checkbox
          name={name}
          id={name}
          autoFocus={autoFocus}
          checked={checked}
          onCheckedChange={(checked) => {
            if (checked === 'indeterminate') return
            onChange(checked)
          }}
        />
        <label htmlFor={name} className="cursor-pointer text-sm leading-5 text-neutral">
          {label}
        </label>
      </div>
      <p className="mt-1 pl-6 text-ssm leading-[18px] text-neutral-subtle">{description}</p>
      {children}
    </div>
  )
}
