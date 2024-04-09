import { type Cluster, ClusterStateEnum, type Organization } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useClusterStatuses } from '@qovery/domains/clusters/feature'
import {
  CLUSTER_SETTINGS_CREDENTIALS_URL,
  CLUSTER_SETTINGS_URL,
  CLUSTER_URL,
  INFRA_LOGS_URL,
} from '@qovery/shared/routes'
import { Banner, WarningScreenMobile } from '@qovery/shared/ui'
import SpotlightTrigger from '../../feature/spotlight-trigger/spotlight-trigger'
import Navigation from '../navigation/navigation'
import TopBar from '../top-bar/top-bar'

export interface LayoutPageProps {
  defaultOrganizationId: string
  topBar?: boolean
  spotlight?: boolean
  organization?: Organization
  clusters?: Cluster[]
}

export const displayClusterDeploymentBanner = (status?: ClusterStateEnum): boolean => {
  return match(status)
    .with(ClusterStateEnum.DEPLOYMENT_QUEUED, ClusterStateEnum.DEPLOYING, () => true)
    .otherwise(() => false)
}

export function LayoutPage(props: PropsWithChildren<LayoutPageProps>) {
  const { children, topBar = true, spotlight = true, clusters, defaultOrganizationId } = props

  const { organizationId = '' } = useParams()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { data: clusterStatuses } = useClusterStatuses({ organizationId })

  const matchLogInfraRoute = pathname.includes(INFRA_LOGS_URL(organizationId, clusterStatuses?.[0]?.cluster_id))

  // Clusters need to be sorted to find the first created cluster
  clusters?.sort(({ created_at: a }, { created_at: b }) => new Date(a).getTime() - new Date(b).getTime())
  const firstCluster = clusters?.[0]
  const firstClusterStatus = firstCluster && clusterStatuses?.find(({ cluster_id }) => firstCluster.id === cluster_id)
  const clusterIsDeployed = firstClusterStatus?.is_deployed

  const clusterBanner =
    !matchLogInfraRoute && clusters && displayClusterDeploymentBanner(firstClusterStatus?.status) && !clusterIsDeployed

  const invalidCluster = clusters?.find(
    ({ id }) =>
      clusterStatuses?.find(({ status }) => status === ClusterStateEnum.INVALID_CREDENTIALS)?.cluster_id === id
  )

  const clusterCredentialError = Boolean(!matchLogInfraRoute && invalidCluster)

  return (
    <>
      <WarningScreenMobile />
      <main className="dark:bg-neutral-900 dark:h-full bg-neutral-200">
        <div className="flex">
          <div className="h-full sticky top-0">
            <Navigation defaultOrganizationId={defaultOrganizationId} clusterNotification={clusterCredentialError} />
          </div>
          <div className="w-full flex flex-col-reverse">
            <div
              className={`relative flex flex-col pt-2 px-2 dark:pt-0 dark:px-0 ${
                clusterCredentialError || clusterBanner ? 'min-h-page-container-wbanner' : 'min-h-page-container'
              }`}
            >
              {children}
            </div>
            {clusterCredentialError && (
              <Banner
                color="yellow"
                onClickButton={() =>
                  navigate(
                    CLUSTER_URL(organizationId, invalidCluster?.id) +
                      CLUSTER_SETTINGS_URL +
                      CLUSTER_SETTINGS_CREDENTIALS_URL
                  )
                }
                buttonLabel="Check the credentials configuration"
              >
                The credentials for the cluster <span className="block font-bold mx-1">{invalidCluster?.name}</span> are
                invalid.
              </Banner>
            )}
            {clusterBanner && (
              <Banner
                color="brand"
                onClickButton={() => navigate(INFRA_LOGS_URL(organizationId, firstCluster?.id))}
                buttonLabel="See logs"
              >
                Installation of the cluster <span className="block font-bold mx-1">{firstCluster?.name}</span> is
                ongoing, you can follow it from logs
              </Banner>
            )}
            {topBar && <TopBar>{spotlight && <SpotlightTrigger />}</TopBar>}
          </div>
        </div>
      </main>
    </>
  )
}

export default LayoutPage
