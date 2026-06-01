import { type ReactNode } from 'react'

export interface Value {
  label: ReactNode
  value: string
  icon?: ReactNode
  isDisabled?: boolean
  disabledTooltip?: ReactNode
  onClickEditable?: () => void
  description?: string
  searchText?: string
}
