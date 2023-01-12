import { Cluster, StateEnum } from 'qovery-typescript-axios'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { OrganizationEntity } from '@qovery/shared/interfaces'
import { INFRA_LOGS_URL } from '@qovery/shared/routes'
import { Banner, BannerStyle, WarningScreenMobile } from '@qovery/shared/ui'
import Navigation from '../navigation/navigation'
import TopBar from '../top-bar/top-bar'

export interface LayoutPageProps {
  children?: React.ReactElement
  topBar?: boolean
  organization?: OrganizationEntity
  cluster?: Cluster
}

export function LayoutPage(props: LayoutPageProps) {
  const { children, topBar = true, cluster } = props

  const { organizationId = '' } = useParams()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const matchLogInfraRoute = pathname.includes(INFRA_LOGS_URL(organizationId, cluster?.id))

  const displayBanner = (status?: StateEnum): boolean => {
    switch (status) {
      case StateEnum.DEPLOYMENT_QUEUED:
      case StateEnum.DEPLOYING:
        return true
      default:
        return false
    }
  }

  return (
    <>
      <WarningScreenMobile />
      <main className="dark:bg-element-light-darker-600 dark:h-screen bg-element-light-lighter-400">
        <div className="flex">
          <div className="h-full sticky top-0 z-20">
            <Navigation />
          </div>
          <div className="w-full">
            {topBar && <TopBar />}
            {!matchLogInfraRoute && cluster && displayBanner(cluster.status) && (
              <Banner
                bannerStyle={BannerStyle.PRIMARY}
                onClickButton={() => navigate(INFRA_LOGS_URL(organizationId, cluster.id))}
                buttonLabel="See logs"
              >
                Installation of the cluster <span className="block font-bold mx-1">{cluster.name}</span> is ongoing, you
                can follow it from logs
              </Banner>
            )}
            <div className="relative flex flex-col min-h-page-container pt-2 px-2 dark:pt-0 dark:px-0">{children}</div>
          </div>
        </div>
      </main>
    </>
  )
}

export default LayoutPage
