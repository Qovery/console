import {
  APPLICATION_DEPLOYMENTS_URL,
  APPLICATION_GENERAL_URL,
  APPLICATION_METRICS_URL,
  APPLICATION_SETTINGS_URL,
  APPLICATION_VARIABLES_URL,
  Route,
} from '@console/shared/router'
import General from '../components/general/general'
import Deployments from '../components/deployments/deployments'
import Metrics from '../components/metrics/metrics'
import Variables from '../components/variables/variables'
import Settings from '../components/settings/settings'

export const ROUTER_APPLICATION: Route[] = [
  {
    path: APPLICATION_GENERAL_URL,
    component: <General />,
  },
  {
    path: APPLICATION_DEPLOYMENTS_URL,
    component: <Deployments />,
  },
  {
    path: APPLICATION_METRICS_URL,
    component: <Metrics />,
  },
  {
    path: APPLICATION_VARIABLES_URL,
    component: <Variables />,
  },
  {
    path: APPLICATION_SETTINGS_URL,
    component: <Settings />,
  },
]
