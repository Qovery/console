import { forwardRef } from 'react'
import { twMerge } from '@qovery/shared/util-js'
import { Icon, type IconSVGProps } from '../icon'

export const SkipIcon = forwardRef<HTMLDivElement, IconSVGProps>(function SkipIcon({ className = '' }, ref) {
  return (
    <div ref={ref} className="flex items-center justify-center">
      <Icon iconName="circle-arrow-right" className={twMerge('text-neutral-disabled', className)} />
    </div>
  )
})

export default SkipIcon
