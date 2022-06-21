import {
  APPLICATION_URL,
  ENVIRONMENTS_URL,
  INFRA_LOGS_URL,
  LOGIN_URL,
  ORGANIZATION_URL,
  OVERVIEW_URL,
  SERVICES_URL,
  SETTINGS_URL,
} from '@console/shared/router'
import { PageLogin } from '@console/pages/login'
import { OverviewPage } from '@console/pages/overview/feature'
import { SettingsPage } from '@console/pages/settings/feature'
import { PageEnvironments } from '@console/pages/environments'
import { PageServices } from '@console/pages/services'
import { PageApplication } from '@console/pages/application'
import { InfraLogsPage } from '@console/pages/logs/infra/feature'
import RedirectOverview from '../components/redirect-overview'

export const ROUTER = [
  {
    path: LOGIN_URL,
    component: <PageLogin />,
    protected: false,
  },
  {
    path: ORGANIZATION_URL(),
    component: <RedirectOverview />,
    protected: true,
    layout: false,
  },
  {
    path: OVERVIEW_URL(),
    component: <OverviewPage />,
    protected: true,
    layout: true,
  },
  {
    path: SETTINGS_URL(),
    component: <SettingsPage />,
    protected: true,
    layout: true,
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
    path: `${INFRA_LOGS_URL()}`,
    component: <InfraLogsPage />,
    protected: true,
    layout: true,
    darkMode: true,
  },
]
