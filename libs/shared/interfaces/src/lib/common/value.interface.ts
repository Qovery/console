import { type ReactNode } from 'react'

export interface Value {
  label: ReactNode
  value: string
  icon?: ReactNode
  isDisabled?: boolean
  onClickEditable?: () => void
  description?: string
  searchText?: string
  /** Optional label to display when this option is selected (in the closed dropdown). Falls back to `label` if not provided. */
  selectedLabel?: ReactNode
}
