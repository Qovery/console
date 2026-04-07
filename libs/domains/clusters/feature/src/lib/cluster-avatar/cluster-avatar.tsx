import { type CloudProviderEnum, type Cluster } from 'qovery-typescript-axios'
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react'
import { match } from 'ts-pattern'
import { Avatar, Icon } from '@qovery/shared/ui'

export interface ClusterAvatarProps extends Omit<ComponentPropsWithoutRef<typeof Avatar>, 'fallback'> {
  cloudProvider?: CloudProviderEnum
  cluster?: Cluster
  customIconSrc?: string
  customIconAlt?: string
}

export const ClusterAvatar = forwardRef<ElementRef<typeof Avatar>, ClusterAvatarProps>(function ClusterAvatar(
  { cluster, cloudProvider, customIconSrc, customIconAlt = 'Custom cloud provider', ...props },
  ref
) {
  const localCloudProvider = cloudProvider ?? cluster?.cloud_provider
  const fallback = match({ cluster, localCloudProvider })
    .when(
      () => Boolean(customIconSrc),
      () => <img src={customIconSrc} alt={customIconAlt} className="h-[65%] w-[65%] object-contain" />
    )
    .with({ cluster: { is_demo: true } }, () => (
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-50">
        <Icon iconName="laptop-code" className="text-sky-500" />
      </div>
    ))
    .with({ localCloudProvider: 'ON_PREMISE' }, () => <Icon name="KUBERNETES" height="65%" width="65%" />)
    .otherwise(() => <Icon name={localCloudProvider} height="65%" width="65%" />)

  return <Avatar ref={ref} fallback={fallback} {...props} />
})
