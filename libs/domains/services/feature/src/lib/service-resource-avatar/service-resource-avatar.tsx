import { cva } from 'class-variance-authority'
import { type JobLifecycleTypeEnum } from 'qovery-typescript-axios'
import { type IconEnum } from '@qovery/shared/enums'
import { Icon, Indicator, ResourceAvatar, ResourceAvatarIcon, Tooltip } from '@qovery/shared/ui'
import { twMerge, upperCaseFirstLetter } from '@qovery/shared/util-js'

const typeVariants = cva('', {
  variants: {
    size: {
      md: ['h-6', 'w-6', 'top-2.5', 'right-2.5'],
      xs: ['h-4', 'w-4', 'top-1', 'right-0.5'],
    },
  },
})

export interface ServiceResourceAvatarProps {
  size: 'md' | 'xs'
  icon: keyof typeof IconEnum
  className?: string
  type?: keyof typeof JobLifecycleTypeEnum
}

// TODO: Prepare component to update service icon with custom icon
export function ServiceResourceAvatar({ className = '', size = 'md', icon, type }: ServiceResourceAvatarProps) {
  return (
    <Indicator
      className={twMerge(typeVariants({ size }))}
      content={
        type && (
          <Tooltip content={`via ${upperCaseFirstLetter(type)}`} disabled={size === 'xs'}>
            <span>
              <Icon className="h-full w-full" name={type} />
            </span>
          </Tooltip>
        )
      }
    >
      <ResourceAvatar size={size} className={className}>
        <ResourceAvatarIcon icon={icon} size={size} />
      </ResourceAvatar>
    </Indicator>
  )
}

export default ServiceResourceAvatar
