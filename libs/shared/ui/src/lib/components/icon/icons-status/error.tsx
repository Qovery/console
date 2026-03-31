import { type LegacyRef, forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import Icon, { type IconSVGProps } from '../icon'

export const ErrorIcon = forwardRef<SVGSVGElement, IconSVGProps>(function ErrorIcon({ className = '', ...props }) {
  return (
    <Icon iconName="circle-exclamation" iconStyle="solid" className={twMerge('text-negative', className)} {...props} />
  )
})

export default ErrorIcon
