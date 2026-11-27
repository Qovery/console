import { InputSelectSmall } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'

export interface Opt {
  value: string
  label: string
}

export function CompactSelect({
  value,
  onChange,
  options,
  label,
  ariaLabel,
  className,
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  options: Opt[]
  label?: string
  ariaLabel?: string
  className?: string
  disabled?: boolean
}) {
  return (
    <InputSelectSmall
      name={ariaLabel ?? label ?? 'billing-selection'}
      ariaLabel={ariaLabel ?? label}
      label={label}
      defaultValue={`option:${value}`}
      onChange={(next) => {
        if (next !== undefined) onChange(next.slice(7))
      }}
      // Keep empty filter values truthy so external resets sync without remounting the focused select.
      items={options.map((option) => ({ ...option, value: `option:${option.value}` }))}
      disabled={disabled}
      className={twMerge('min-w-28 max-w-full', className)}
      inputClassName="h-8 pr-8"
    />
  )
}
