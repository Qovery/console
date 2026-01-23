import { twMerge } from '@qovery/shared/util-js'
import Icon from '../../icon/icon'
import { type DatePickerPeriodOption } from '../date-picker.types'

export interface DatePickerPeriodListProps {
  options: DatePickerPeriodOption[]
  value?: string
  onChange?: (value: string) => void
  className?: string
  lockedLabel?: string
}

export function DatePickerPeriodList({ options, value, onChange, className, lockedLabel }: DatePickerPeriodListProps) {
  if (options.length === 0) return null

  const lockedOptions = options.filter((option) => option.isLocked)
  const unlockedOptions = options.filter((option) => !option.isLocked)
  const hasLocked = lockedOptions.length > 0
  const hasUnlocked = unlockedOptions.length > 0

  const renderOptions = (items: DatePickerPeriodOption[]) =>
    items.map((option) => {
      const isSelected = option.value === value
      const isLocked = Boolean(option.isLocked)
      const isDisabled = Boolean(option.isDisabled || option.isLocked)

      return (
        <button
          key={option.value}
          type="button"
          disabled={isDisabled}
          className={twMerge(
            'flex w-full items-center justify-between rounded px-3 py-2 text-sm text-neutral transition-colors',
            'hover:bg-surface-neutral-component disabled:cursor-not-allowed disabled:bg-transparent disabled:text-neutral-disabled',
            isSelected ? 'bg-surface-brand-subtle text-brand hover:bg-surface-brand-subtle' : ''
          )}
          onClick={() => {
            if (isDisabled) return
            onChange?.(option.value)
          }}
        >
          <span>{option.label}</span>
          {isLocked && <Icon iconName="lock" className="text-xs text-neutral-disabled" />}
        </button>
      )
    })

  return (
    <div className={twMerge('flex min-w-48 flex-col gap-1 px-1 py-2', className)}>
      {hasUnlocked && (
        <div className={twMerge('flex flex-col gap-1', hasLocked ? 'border-b border-neutral pb-2' : '')}>
          {renderOptions(unlockedOptions)}
        </div>
      )}
      {hasLocked && (
        <div className={twMerge('flex flex-col gap-1', hasUnlocked ? 'pt-2' : '')}>
          {lockedLabel && <p className="mb-1 px-3 text-ssm text-neutral-subtle">{lockedLabel}</p>}
          {renderOptions(lockedOptions)}
        </div>
      )}
    </div>
  )
}

export default DatePickerPeriodList
