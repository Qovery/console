import { ClusterStateEnum } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { type ClusterEntity, type OrganizationEntity } from '@qovery/shared/interfaces'
import {
  CLUSTER_SETTINGS_CREDENTIALS_URL,
  CLUSTER_SETTINGS_URL,
  CLUSTER_URL,
  INFRA_LOGS_URL,
} from '@qovery/shared/routes'
import { Banner, WarningScreenMobile } from '@qovery/shared/ui'
import Navigation from '../navigation/navigation'
import TopBar from '../top-bar/top-bar'

export interface LayoutPageProps {
  defaultOrganizationId: string
  topBar?: boolean
  organization?: OrganizationEntity
  clusters?: ClusterEntity[]
}

export const displayClusterDeploymentBanner = (status?: ClusterStateEnum): boolean => {
  return match(status)
    .with(ClusterStateEnum.DEPLOYMENT_QUEUED, ClusterStateEnum.DEPLOYING, () => true)
    .otherwise(() => false)
}

export const displayClusterCredentialErrorBanner = (clusters?: ClusterEntity[]): ClusterEntity[] => {
  if (!clusters) return []
  const clustersDeploymentError = clusters?.filter((c) => c.status === ClusterStateEnum.DEPLOYMENT_ERROR)
  return clustersDeploymentError
}

export function LayoutPage(props: PropsWithChildren<LayoutPageProps>) {
  const { children, topBar = true, clusters, defaultOrganizationId } = props

  const { organizationId = '' } = useParams()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const matchLogInfraRoute = pathname.includes(INFRA_LOGS_URL(organizationId, clusters?.[0]?.id))

  const clusterIsDeployed = clusters?.[0]?.extendedStatus?.status?.is_deployed

  const clusterBanner =
    !matchLogInfraRoute && clusters && displayClusterDeploymentBanner(clusters?.[0]?.status) && !clusterIsDeployed

  const clusterCredentialError = !matchLogInfraRoute && displayClusterCredentialErrorBanner(clusters).length > 0
  const clusterNotification = ClusterStateEnum.DEPLOYMENT_ERROR === clusters?.[0]?.status

  return (
    <>
      <WarningScreenMobile />
      <main className="dark:bg-neutral-900 dark:h-full bg-neutral-200">
        <div className="flex">
          <div className="h-full sticky top-0 z-30">
            <Navigation defaultOrganizationId={defaultOrganizationId} clusterNotification={clusterNotification} />
          </div>
          <div className="w-full">
            {topBar && <TopBar />}
            {clusterBanner && (
              <Banner
                color="brand"
                onClickButton={() => navigate(INFRA_LOGS_URL(organizationId, clusters[0].id))}
                buttonLabel="See logs"
              >
                Installation of the cluster <span className="block font-bold mx-1">{clusters[0].name}</span> is ongoing,
                you can follow it from logs
              </Banner>
            )}
            {clusterCredentialError && (
              <Banner
                color="yellow"
                onClickButton={() =>
                  navigate(
                    CLUSTER_URL(organizationId, displayClusterCredentialErrorBanner(clusters)?.[0].id) +
                      CLUSTER_SETTINGS_URL +
                      CLUSTER_SETTINGS_CREDENTIALS_URL
                  )
                }
                buttonLabel="Check the credentials configuration"
              >
                The credentials for the cluster{' '}
                <span className="block font-bold mx-1">{displayClusterCredentialErrorBanner(clusters)?.[0].name}</span>{' '}
                are invalid.
              </Banner>
            )}
            <div
              className={`relative flex flex-col pt-2 px-2 dark:pt-0 dark:px-0 ${
                clusterCredentialError || clusterBanner ? 'min-h-page-container-wbanner' : 'min-h-page-container'
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
