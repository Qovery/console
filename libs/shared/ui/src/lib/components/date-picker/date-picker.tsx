import { type PropsWithChildren, useEffect, useState } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import DatePickerCalendar from './date-picker-calendar/date-picker-calendar'
import DatePickerPeriodList from './date-picker-period-list/date-picker-period-list'
import { type DatePickerProps } from './date-picker.types'
import { getPeriodDates } from './date-picker.utils'

export function DatePicker({
  isOpen,
  children,
  showCalendar = true,
  showPeriodSelect,
  periodOptions,
  periodValue,
  onPeriodChange,
  lockedLabel,
  onClickOutside,
  onChange,
  maxDate,
  defaultDates,
  ...calendarProps
}: PropsWithChildren<DatePickerProps>) {
  const shouldShowPeriodList = showPeriodSelect && (periodOptions?.length ?? 0) > 0
  const shouldShowCalendar = showCalendar !== false
  const hasPanels = shouldShowCalendar || shouldShowPeriodList
  const [periodDates, setPeriodDates] = useState<[Date, Date] | undefined>()

  useEffect(() => {
    if (defaultDates) {
      setPeriodDates(undefined)
    }
  }, [defaultDates])

  useEffect(() => {
    if (!isOpen || shouldShowCalendar || !onClickOutside) return

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const datepickerContainer = target.closest('.date-picker')

      if (datepickerContainer) {
        return
      }

      onClickOutside()
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [isOpen, onClickOutside, shouldShowCalendar])

  const handleRangeSelection = () => {
    if (!periodValue) return
    onPeriodChange?.('')
    setPeriodDates(undefined)
  }

  const handlePeriodChange = (value: string) => {
    onPeriodChange?.(value)
    const now = new Date()
    const endDate = maxDate && maxDate < now ? maxDate : now
    const range = getPeriodDates(value, endDate)
    if (!range) return
    setPeriodDates(range)
    onChange(range[0], range[1])
  }

  return (
    <div className="relative">
      {children}
      {isOpen && hasPanels && (
        <div className={`date-picker absolute z-10 mt-2.5 ${isOpen ? 'date-picker--open' : ''}`}>
          <div className="mt-2 inline-flex rounded-lg border border-neutral bg-surface-neutral shadow-[0_0_4px_rgba(0,0,0,0.01)]">
            <div className={twMerge('flex', shouldShowCalendar && shouldShowPeriodList ? 'items-stretch' : 'flex-col')}>
              {shouldShowPeriodList && (
                <DatePickerPeriodList
                  options={periodOptions ?? []}
                  value={periodValue}
                  onChange={handlePeriodChange}
                  lockedLabel={lockedLabel}
                  className={shouldShowCalendar ? 'border-r border-neutral' : ''}
                />
              )}
              {shouldShowCalendar && (
                <DatePickerCalendar
                  {...calendarProps}
                  maxDate={maxDate}
                  defaultDates={periodDates ?? defaultDates}
                  onChange={onChange}
                  onRangeSelection={handleRangeSelection}
                  onClickOutside={onClickOutside}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DatePicker
