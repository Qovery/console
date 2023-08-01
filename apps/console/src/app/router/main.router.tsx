import { ReactElement } from 'react'
import { PageApplication } from '@qovery/pages/application'
import { PagesCluster } from '@qovery/pages/cluster'
import { PageClusters } from '@qovery/pages/clusters'
import { PageDatabase } from '@qovery/pages/database'
import { PageEnvironments } from '@qovery/pages/environments'
import { PageEvents } from '@qovery/pages/events'
import { PageEnvironmentLogs } from '@qovery/pages/logs/environment'
import { PageInfraLogs } from '@qovery/pages/logs/infra'
import { PageOnboarding } from '@qovery/pages/onboarding'
import { OverviewPage } from '@qovery/pages/overview/feature'
import { PageServices } from '@qovery/pages/services'
import { PageSettings } from '@qovery/pages/settings'
import { AcceptInvitationFeature, GithubApplicationCallbackFeature } from '@qovery/shared/console-shared'
import {
  ACCEPT_INVITATION_URL,
  APPLICATION_URL,
  AUDIT_LOGS_URL,
  CLUSTERS_URL,
  CLUSTER_URL,
  DATABASE_URL,
  ENVIRONMENTS_URL,
  ENVIRONMENT_LOGS_URL,
  GITHUB_APPLICATION_CALLBACK_URL,
  INFRA_LOGS_URL,
  ONBOARDING_URL,
  ORGANIZATION_URL,
  OVERVIEW_URL,
  SERVICES_URL,
  SETTINGS_URL,
} from '@qovery/shared/routes'
import RedirectOverview from '../components/redirect-overview'

interface RouterProps {
  path: string
  component: ReactElement
  protected: boolean
  layout: boolean
  darkMode?: boolean
  topBar?: boolean
}

export const ROUTER: RouterProps[] = [
  {
    path: `${ONBOARDING_URL}/*`,
    component: <PageOnboarding />,
    protected: true,
    layout: false,
  },
  {
    path: `${GITHUB_APPLICATION_CALLBACK_URL}`,
    component: <GithubApplicationCallbackFeature />,
    protected: true,
    layout: false,
  },
  {
    path: `${ACCEPT_INVITATION_URL}`,
    component: <AcceptInvitationFeature />,
    protected: true,
    layout: false,
  },
  {
    path: ORGANIZATION_URL(),
    component: <RedirectOverview />,
    protected: true,
    layout: false,
  },
  {
    path: `${AUDIT_LOGS_URL()}/*`,
    component: <PageEvents />,
    protected: true,
    layout: true,
    topBar: false,
  },
  {
    path: OVERVIEW_URL(),
    component: <OverviewPage />,
    protected: true,
    layout: true,
  },
  {
    path: `${SETTINGS_URL()}/*`,
    component: <PageSettings />,
    protected: true,
    layout: true,
    topBar: false,
  },
  {
    path: `${ENVIRONMENTS_URL()}/*`,
    component: <PageEnvironments />,
    protected: true,
    layout: true,
  },
  {
    path: `${SERVICES_URL()}/*`,
    component: <PageServices />,
    protected: true,
    layout: true,
  },
  {
    path: `${APPLICATION_URL()}/*`,
    component: <PageApplication />,
    protected: true,
    layout: true,
  },
  {
    path: `${DATABASE_URL()}/*`,
    component: <PageDatabase />,
    protected: true,
    layout: true,
  },
  {
    path: `${CLUSTERS_URL()}/*`,
    component: <PageClusters />,
    protected: true,
    layout: true,
    topBar: false,
  },
  {
    path: `${CLUSTER_URL()}/*`,
    component: <PagesCluster />,
    protected: true,
    layout: true,
  },
  {
    path: `${INFRA_LOGS_URL()}`,
    component: <PageInfraLogs />,
    protected: true,
    layout: true,
    darkMode: true,
  },
  {
    path: `${ENVIRONMENT_LOGS_URL()}/*`,
    component: <PageEnvironmentLogs />,
    protected: true,
    layout: true,
    darkMode: true,
  },
]
