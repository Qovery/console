import { forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import { Icon, type IconSVGProps } from '../icon'

export const SkipIcon = forwardRef<SVGSVGElement, IconSVGProps>(function SkipIcon(
  { className = '', ...props },
  forwardedRef
) {
  return (
    <div className="flex items-center justify-center">
      <Icon iconName="circle-arrow-right" className={twMerge('text-neutral-disabled', className)} />
    </div>
  )
})

export default SkipIcon
