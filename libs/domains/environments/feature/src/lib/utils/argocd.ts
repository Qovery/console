import { type EnvironmentOverviewResponse } from 'qovery-typescript-axios'

export function isArgoCdEnvironment(overview?: EnvironmentOverviewResponse): boolean {
  return overview?.services_overview.managed_by === 'ARGOCD'
}
