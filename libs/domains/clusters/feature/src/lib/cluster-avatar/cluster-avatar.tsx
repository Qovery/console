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
  const fallback = match(cluster)
    .with({ is_demo: true }, () => (
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-50">
        <Icon iconName="laptop-code" className="text-sky-500" />
      </div>
    ))
    .with({ cloud_provider: 'ON_PREMISE' }, () => <Icon name="KUBERNETES" height="65%" width="65%" />)
    .otherwise((c) => <Icon name={c.cloud_provider} height="65%" width="65%" />)

  return <Avatar ref={ref} fallback={fallback} {...props} />
})
