// import posthog from 'posthog-js'
import { matchPath, useLocation, useParams } from 'react-router'
import { INFRA_LOGS_URL } from '../router'
import { NoBetaAccess } from '../pages/no-beta-access'
import posthog from 'posthog-js'

export interface IBetaRoute {
  children: React.ReactElement
}

export const BetaRoute = ({ children }: IBetaRoute) => {
  const { organizationId = '' } = useParams()
  const location = useLocation()

  const matchLogInfraRoute = matchPath(location.pathname || '', INFRA_LOGS_URL(organizationId))

  if (posthog.isFeatureEnabled('v3-beta')) {
    return children
  }

  if (matchLogInfraRoute) {
    return children
  }

  return <NoBetaAccess />
}

export default BetaRoute
