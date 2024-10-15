import { type Environment } from 'qovery-typescript-axios'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { Avatar, Icon } from '@qovery/shared/ui'

export interface EnvironmentAvatarProps extends Omit<ComponentPropsWithoutRef<typeof Avatar>, 'fallback'> {
  environment: Environment
}

export const EnvironmentAvatar = forwardRef<ElementRef<typeof Avatar>, EnvironmentAvatarProps>(
  function EnvironmentAvatar({ environment, className, ...props }, ref) {
    return (
      <Avatar ref={ref} className={className} fallback={<Icon name="SERVICES" height="40" width="40" />} {...props} />
    )
  }
)
