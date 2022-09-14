import { PageApplication } from '@qovery/pages/application'
import { PageDatabase } from '@qovery/pages/database'
import { PageEnvironments } from '@qovery/pages/environments'
import { PageInfraLogs } from '@qovery/pages/logs/infra'
import { OverviewPage } from '@qovery/pages/overview/feature'
import { PageServices } from '@qovery/pages/services'
import { PageSettings } from '@qovery/pages/settings'
import {
  APPLICATION_URL,
  DATABASE_URL,
  ENVIRONMENTS_URL,
  INFRA_LOGS_URL,
  ORGANIZATION_URL,
  OVERVIEW_URL,
  SERVICES_URL,
  SETTINGS_URL,
} from '@qovery/shared/router'
import RedirectOverview from '../components/redirect-overview'

export const ROUTER = [
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
    component: <PageSettings />,
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
    path: `${DATABASE_URL()}/*`,
    component: <PageDatabase />,
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
]
