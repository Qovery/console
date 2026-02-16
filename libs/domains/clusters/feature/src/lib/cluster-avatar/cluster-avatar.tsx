import { type CloudProviderEnum, type Cluster, type ClusterOverviewResponse } from 'qovery-typescript-axios'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { match } from 'ts-pattern'
import { Avatar, Icon } from '@qovery/shared/ui'

export interface ClusterAvatarProps extends Omit<ComponentPropsWithoutRef<typeof Avatar>, 'fallback'> {
  cloudProvider?: CloudProviderEnum
  cluster?: Cluster | ClusterOverviewResponse
}

export const ClusterAvatar = forwardRef<ElementRef<typeof Avatar>, ClusterAvatarProps>(function ClusterAvatar(
  { cluster, cloudProvider, ...props },
  ref
) {
  const localCloudProvider = cloudProvider ?? cluster?.cloud_provider
  const fallback = match({ cluster, localCloudProvider })
    .with({ cluster: { is_demo: true } }, () => (
      <Icon iconName="laptop-code" className="text-base text-neutral-subtle" />
    ))
    .with({ localCloudProvider: 'ON_PREMISE' }, () => <Icon name="KUBERNETES" height="65%" width="65%" />)
    .otherwise(() => <Icon name={localCloudProvider} height="65%" width="65%" />)

  return <Avatar ref={ref} fallback={fallback} {...props} />
})
