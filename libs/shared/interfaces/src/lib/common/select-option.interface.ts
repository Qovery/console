import { type GitRepository } from 'qovery-typescript-axios'
import { type ReactNode } from 'react'

export type SelectOptionValue = string | GitRepository

export type SelectOption = {
  label: ReactNode
  value: SelectOptionValue
  icon?: ReactNode
  isDisabled?: boolean
  onClickEditable?: () => void
  description?: string
}
