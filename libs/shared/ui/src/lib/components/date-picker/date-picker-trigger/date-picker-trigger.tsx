import { type IconName, type IconStyle } from '@fortawesome/fontawesome-common-types'
import { type ComponentPropsWithoutRef, type ReactNode } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import Button from '../../button/button'
import Icon from '../../icon/icon'

export interface DatePickerTriggerProps extends Omit<ComponentPropsWithoutRef<typeof Button>, 'children'> {
  mode?: 'icon' | 'range'
  rangeLabel?: ReactNode
  onClear?: () => void
  showClear?: boolean
  iconName?: IconName
  iconStyle?: IconStyle
  clearIconName?: IconName
  clearIconStyle?: IconStyle
  children?: ReactNode
}

export function DatePickerTrigger({
  mode = 'range',
  rangeLabel,
  onClear,
  showClear,
  iconName = 'calendar',
  iconStyle = 'regular',
  clearIconName = 'xmark',
  clearIconStyle = 'regular',
  className,
  variant = 'surface',
  color = 'neutral',
  size = 'md',
  type = 'button',
  children,
  onClick,
  ...props
}: DatePickerTriggerProps) {
  const shouldShowClear = showClear ?? Boolean(onClear)
  const label = children ?? rangeLabel

  return (
    <Button
      {...props}
      type={type}
      variant={variant}
      color={color}
      size={size}
      onClick={onClick}
      className={twMerge('active:scale-100', className)}
    >
      {mode === 'icon' && <Icon iconName={iconName} iconStyle={iconStyle} />}
      {mode === 'range' && label}
      {mode === 'range' && shouldShowClear && onClear && (
        <span
          className="relative left-1 px-1 py-1"
          role="button"
          onClick={(event) => {
            event.stopPropagation()
            onClear()
          }}
        >
          <Icon iconName={clearIconName} iconStyle={clearIconStyle} />
        </span>
      )}
    </Button>
  )
}

export default DatePickerTrigger
