import { type ReactNode } from 'react'

export type SelectOptionValue = string

export type SelectOption = {
  label: ReactNode
  value: SelectOptionValue
  icon?: ReactNode
  isDisabled?: boolean
  onClickEditable?: () => void
  description?: string
}
