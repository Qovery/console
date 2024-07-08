import { type Cluster } from 'qovery-typescript-axios'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { match } from 'ts-pattern'
import { Avatar, Icon } from '@qovery/shared/ui'

export interface ClusterAvatarProps extends Omit<ComponentPropsWithoutRef<typeof Avatar>, 'fallback'> {
  cluster: Cluster
}

export const ClusterAvatar = forwardRef<ElementRef<typeof Avatar>, ClusterAvatarProps>(function ClusterAvatar(
  { cluster, ...props },
  ref
) {
  const iconName = match(cluster.cloud_provider)
    .with('ON_PREMISE', () => 'KUBERNETES')
    .otherwise((cloud_provider) => cloud_provider)

  return <Avatar ref={ref} fallback={<Icon name={iconName} height="65%" width="65%" />} {...props} />
})
