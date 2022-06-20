import posthog from 'posthog-js'
import { matchPath, useLocation, useParams } from 'react-router'
import { INFRA_LOGS_URL, NO_BETA_ACCESS_URL } from '../router'
import { useNavigate } from 'react-router-dom'

export interface IBetaRoute {
  children: React.ReactElement
}

export const BetaRoute = ({ children }: IBetaRoute) => {
  const { organizationId = '' } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const matchLogInfraRoute = matchPath(location.pathname || '', INFRA_LOGS_URL(organizationId))

  if (posthog.isFeatureEnabled('v3-beta')) {
    return children
  }

  if (matchLogInfraRoute) {
    return children
  }

  navigate(NO_BETA_ACCESS_URL, { replace: true })
  return null
}

export default BetaRoute
