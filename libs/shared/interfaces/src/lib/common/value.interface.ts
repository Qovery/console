import { ReactNode } from 'react'

export interface Value {
  label: string
  value: string
  icon?: ReactNode
  isDisabled?: boolean
  externalClick?: () => void
}
