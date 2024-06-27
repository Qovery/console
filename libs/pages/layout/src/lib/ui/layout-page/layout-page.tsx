import { type Cluster, ClusterStateEnum, type Organization } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useClusterStatuses } from '@qovery/domains/clusters/feature'
import { AssistantTrigger } from '@qovery/shared/assistant/feature'
import { useUserAccount } from '@qovery/shared/iam/feature'
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

/*
  Admin function to display the Console on the mobile
  - If the user is a Qovery employee, the console is displayed on the mobile
  - If the user has set the debug view to desktop, the console is displayed on the mobile
*/
function checkQoveryUser(communication_email?: string) {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  const isQoveryUser = communication_email?.endsWith('@qovery.com')

  const debugViewDesktop = localStorage.getItem('qovery-debug-view-desktop') === 'true'

  return (isMobile && isQoveryUser) || (debugViewDesktop && isQoveryUser)
}

export function LayoutPage(props: PropsWithChildren<LayoutPageProps>) {
  const { children, topBar = true, spotlight = true, clusters, defaultOrganizationId } = props

  const { organizationId = '' } = useParams()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { data: clusterStatuses } = useClusterStatuses({ organizationId })
  const { data: user } = useUserAccount()

  const isQoveryUser = checkQoveryUser(user?.communication_email)

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
      {!isQoveryUser && <WarningScreenMobile />}
      <main className="bg-neutral-200 dark:h-full dark:bg-neutral-900">
        <div className="flex">
          <div className="sticky top-0 h-full">
            <Navigation defaultOrganizationId={defaultOrganizationId} clusterNotification={clusterCredentialError} />
          </div>
          <div className="flex w-full grow flex-col-reverse">
            <div>
              <div
                className={`relative flex ${
                  clusterCredentialError || clusterBanner ? 'min-h-page-container-wbanner' : 'min-h-page-container'
                }`}
              >
                <div className="flex grow flex-col px-2 pt-2 dark:px-0 dark:pt-0">{children}</div>
                <AssistantTrigger />
              </div>
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
                The credentials for the cluster <span className="mx-1 block font-bold">{invalidCluster?.name}</span> are
                invalid.
              </Banner>
            )}
            {clusterBanner && (
              <Banner
                color="brand"
                onClickButton={() => navigate(INFRA_LOGS_URL(organizationId, firstCluster?.id))}
                buttonLabel="See logs"
              >
                Installation of the cluster <span className="mx-1 block font-bold">{firstCluster?.name}</span> is
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
