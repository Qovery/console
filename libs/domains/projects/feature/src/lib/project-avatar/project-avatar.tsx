import { type Project } from 'qovery-typescript-axios'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { Avatar, Icon } from '@qovery/shared/ui'

export interface ProjectAvatarProps extends Omit<ComponentPropsWithoutRef<typeof Avatar>, 'fallback'> {
  project: Project
}

export const ProjectAvatar = forwardRef<ElementRef<typeof Avatar>, ProjectAvatarProps>(function ProjectAvatar(
  { project, ...props },
  ref
) {
  return <Avatar ref={ref} fallback={<Icon name="ENVIRONMENT" height="100%" width="100%" />} {...props} />
})
