import { type IconName } from '@fortawesome/fontawesome-common-types'
import { ClusterDeploymentStatusEnum } from 'qovery-typescript-axios'
import { useState } from 'react'
import { Banner, BannerNavigation } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { useWideCredentialsInstructions } from '../hooks/use-wide-credentials-instructions/use-wide-credentials-instructions'

export interface ClusterOverviewBannersProps {
  deploymentStatus?: ClusterDeploymentStatusEnum
  onDeploy: () => void
}

interface ClusterOverviewBanner {
  id: 'extended-credentials' | 'redeploy'
  message: string
  buttonLabel: string
  buttonIconRight?: IconName
  onClickButton: () => void
}

export function ClusterOverviewBanners({ deploymentStatus, onDeploy }: ClusterOverviewBannersProps) {
  const { isRequired, openInstructions } = useWideCredentialsInstructions()
  const [selectedBannerId, setSelectedBannerId] = useState<ClusterOverviewBanner['id']>()
  const banners: ClusterOverviewBanner[] = []

  if (isRequired) {
    banners.push({
      id: 'extended-credentials',
      message: 'Extended credentials required',
      buttonLabel: 'View instructions',
      onClickButton: openInstructions,
    })
  }

  if (deploymentStatus !== ClusterDeploymentStatusEnum.UP_TO_DATE) {
    const action = deploymentStatus === ClusterDeploymentStatusEnum.OUT_OF_DATE ? 'redeploy' : 'deploy'
    banners.push({
      id: 'redeploy',
      message: `This cluster needs to be ${action}ed to apply the configuration changes`,
      buttonLabel: deploymentStatus === ClusterDeploymentStatusEnum.OUT_OF_DATE ? 'Redeploy now' : 'Deploy now',
      buttonIconRight: 'rotate-right',
      onClickButton: onDeploy,
    })
  }

  if (banners.length === 0) return null

  const selectedIndex = banners.findIndex((banner) => banner.id === selectedBannerId)
  const currentIndex = selectedIndex === -1 ? 0 : selectedIndex
  const banner = banners[currentIndex]
  const hasMultiple = banners.length > 1

  return (
    <Banner
      className={twMerge('relative left-1/2 w-screen -translate-x-1/2', hasMultiple && 'pl-4 pr-28 sm:px-28')}
      color="yellow"
      buttonIconRight={banner.buttonIconRight}
      buttonLabel={banner.buttonLabel}
      onClickButton={banner.onClickButton}
    >
      <span className="min-w-0 truncate text-center" title={banner.message}>
        {banner.message}
      </span>
      <BannerNavigation
        currentIndex={currentIndex}
        count={banners.length}
        onPrevious={() => setSelectedBannerId(banners[(currentIndex - 1 + banners.length) % banners.length].id)}
        onNext={() => setSelectedBannerId(banners[(currentIndex + 1) % banners.length].id)}
      />
    </Banner>
  )
}
