import { APPLICATIONS_GENERAL_URL, Route } from '@console/shared/utils'
import General from '../components/general/general'

export const ROUTER_APPLICATIONS: Route[] = [
  {
    path: APPLICATIONS_GENERAL_URL,
    component: <General />,
  },
]
