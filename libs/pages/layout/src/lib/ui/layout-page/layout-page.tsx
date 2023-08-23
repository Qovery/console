import { StateEnum } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ClusterEntity, OrganizationEntity } from '@qovery/shared/interfaces'
import { INFRA_LOGS_URL } from '@qovery/shared/routes'
import { Banner, BannerStyle, WarningScreenMobile } from '@qovery/shared/ui'
import Navigation from '../navigation/navigation'
import TopBar from '../top-bar/top-bar'

export interface LayoutPageProps {
  defaultOrganizationId: string
  topBar?: boolean
  organization?: OrganizationEntity
  cluster?: ClusterEntity
}

export const displayClusterBanner = (status?: StateEnum): boolean => {
  switch (status) {
    case StateEnum.DEPLOYMENT_QUEUED:
    case StateEnum.DEPLOYING:
      return true
    default:
      return false
  }
}

export function LayoutPage(props: PropsWithChildren<LayoutPageProps>) {
  const { children, topBar = true, cluster, defaultOrganizationId } = props

  const { organizationId = '' } = useParams()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const matchLogInfraRoute = pathname.includes(INFRA_LOGS_URL(organizationId, cluster?.id))

  const clusterIsDeployed = cluster?.extendedStatus?.status?.is_deployed

  const clusterBanner = !matchLogInfraRoute && cluster && displayClusterBanner(cluster.status) && !clusterIsDeployed

  return (
    <>
      <WarningScreenMobile />
      <main className="dark:bg-neutral-900 dark:h-full bg-neutral-200">
        <div className="flex">
          <div className="h-full sticky top-0 z-30">
            <Navigation defaultOrganizationId={defaultOrganizationId} />
          </div>
          <div className="w-full">
            {topBar && <TopBar />}
            {clusterBanner && (
              <Banner
                bannerStyle={BannerStyle.PRIMARY}
                onClickButton={() => navigate(INFRA_LOGS_URL(organizationId, cluster.id))}
                buttonLabel="See logs"
              >
                Installation of the cluster <span className="block font-bold mx-1">{cluster.name}</span> is ongoing, you
                can follow it from logs
              </Banner>
            )}
            <div
              className={`relative flex flex-col pt-2 px-2 dark:pt-0 dark:px-0 ${
                clusterBanner ? 'min-h-page-container-wbanner' : 'min-h-page-container'
              }`}
            >
              {children}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default LayoutPage
