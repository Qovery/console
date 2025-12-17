import { useFeatureFlagVariantKey } from 'posthog-js/react'
import { type Cluster, ClusterStateEnum, type Organization } from 'qovery-typescript-axios'
import { type PropsWithChildren, useMemo } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { ClusterDeploymentProgressCard, useClusterStatuses } from '@qovery/domains/clusters/feature'
import { useAlerts } from '@qovery/domains/observability/feature'
import { FreeTrialBanner, InvoiceBanner, useOrganization } from '@qovery/domains/organizations/feature'
import { AssistantTrigger } from '@qovery/shared/assistant/feature'
import { DevopsCopilotButton, DevopsCopilotTrigger } from '@qovery/shared/devops-copilot/feature'
import { useUserRole } from '@qovery/shared/iam/feature'
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
function checkQoveryUser(isQoveryAdminUser: boolean) {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  const debugViewDesktop = localStorage.getItem('qovery-debug-view-desktop') === 'true'

  return (isMobile && isQoveryAdminUser) || (debugViewDesktop && isQoveryAdminUser)
}

export function LayoutPage(props: PropsWithChildren<LayoutPageProps>) {
  const { children, topBar = true, spotlight = true, clusters, defaultOrganizationId } = props

  const { organizationId = '' } = useParams()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { data: clusterStatuses } = useClusterStatuses({ organizationId, enabled: !!organizationId })
  const { data: organization } = useOrganization({ organizationId })
  const { roles, isQoveryAdminUser } = useUserRole()
  const isAlertingFeatureFlagEnabled = useFeatureFlagVariantKey('alerting')
  const isFeatureFlag = useFeatureFlagVariantKey('devops-copilot')

  const isQoveryUserWithMobileCheck = checkQoveryUser(isQoveryAdminUser)

  const matchLogInfraRoute = pathname.includes(INFRA_LOGS_URL(organizationId, clusterStatuses?.[0]?.cluster_id))

  // Clusters need to be sorted to find the first created cluster
  clusters?.sort(({ created_at: a }, { created_at: b }) => new Date(a).getTime() - new Date(b).getTime())

  const invalidCluster = clusters?.find(
    ({ id }) =>
      clusterStatuses?.find(({ status }) => status === ClusterStateEnum.INVALID_CREDENTIALS)?.cluster_id === id
  )

  const clusterUpgradeWarning = clusters?.find(({ id, cloud_provider }) => {
    const updatedClusters = clusterStatuses?.find(
      ({ next_k8s_available_version }) => next_k8s_available_version !== null
    )
    return updatedClusters?.cluster_id === id && cloud_provider !== 'ON_PREMISE'
  })

  const clusterCredentialError = Boolean(!matchLogInfraRoute && invalidCluster)
  const clusterStatusesError = clusterStatuses?.some(({ status }) =>
    match(status)
      .with(
        ClusterStateEnum.BUILD_ERROR,
        ClusterStateEnum.DELETE_ERROR,
        ClusterStateEnum.STOP_ERROR,
        ClusterStateEnum.DEPLOYMENT_ERROR,
        ClusterStateEnum.RESTART_ERROR,
        () => true
      )
      .otherwise(() => false)
  )

  const { data: alerts = [] } = useAlerts({
    organizationId,
    enabled: Boolean(organizationId && isAlertingFeatureFlagEnabled),
  })

  const hasFiringAlerts = useMemo(
    () =>
      alerts.some(({ state }) =>
        match(state)
          .with('TRIGGERED', 'PENDING_NOTIFICATION', 'NOTIFIED', () => true)
          .otherwise(() => false)
      ),
    [alerts]
  )

  // Display Qovery admin if we don't have the organization in the token
  const displayQoveryAdminBanner = useMemo(() => {
    if (isQoveryAdminUser) {
      const checkIfUserHasOrganization = roles.some((org) => org.includes(organizationId)) ?? true
      return !checkIfUserHasOrganization
    }
    return false
  }, [roles, organizationId, isQoveryAdminUser])

  const deployingClusters = useMemo(() => {
    if (!clusters || !clusterStatuses) return []
    return clusters.filter((cluster) => {
      const status = clusterStatuses.find(({ cluster_id }) => cluster_id === cluster.id)?.status
      return displayClusterDeploymentBanner(status)
    })
  }, [clusters, clusterStatuses])

  const showFloatingDeploymentCard = useMemo(() => {
    return deployingClusters.length > 0
  }, [deployingClusters])

  return (
    <>
      {displayQoveryAdminBanner && (
        <Banner color="yellow">
          Qovery admin message - This organization is a customer (<b>{organization?.name}</b>), please be careful with
          actions.
        </Banner>
      )}
      {!isQoveryUserWithMobileCheck && <WarningScreenMobile />}
      <main className="bg-neutral-200 dark:h-full dark:bg-neutral-900">
        <div className="flex">
          <div className="sticky top-0 h-full">
            <Navigation
              defaultOrganizationId={defaultOrganizationId}
              clusterNotification={
                clusterCredentialError || clusterStatusesError ? 'error' : clusterUpgradeWarning ? 'warning' : undefined
              }
              alertingNotification={hasFiringAlerts ? 'error' : undefined}
            />
          </div>
          <div className="flex w-full grow flex-col-reverse">
            <div>
              <div
                className={`relative flex ${
                  clusterCredentialError ? 'min-h-page-container-wbanner' : 'min-h-page-container'
                }`}
              >
                <div className="flex grow flex-col px-2 pt-2 dark:px-0 dark:pt-0">{children}</div>
                <AssistantTrigger />
                {isFeatureFlag && <DevopsCopilotTrigger />}
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
            <FreeTrialBanner />
            <InvoiceBanner />
            {topBar && (
              <TopBar>
                <div className="flex items-center">
                  {spotlight && <SpotlightTrigger />}
                  {isFeatureFlag && <DevopsCopilotButton />}
                </div>
              </TopBar>
            )}
          </div>
        </div>
        {showFloatingDeploymentCard && (
          <ClusterDeploymentProgressCard organizationId={organizationId} clusters={deployingClusters} />
        )}
      </main>
    </>
  )
}

export default LayoutPage
