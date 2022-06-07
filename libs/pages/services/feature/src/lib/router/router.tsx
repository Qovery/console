import { SERVICES_GENERAL_URL, Route } from '@console/shared/utils'
import General from '../components/general/general'

export const ROUTER_SERVICES: Route[] = [
  {
    path: SERVICES_GENERAL_URL,
    component: <General />,
  },
]
