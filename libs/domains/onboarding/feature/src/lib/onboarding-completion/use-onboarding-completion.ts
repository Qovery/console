import { useQueries } from '@tanstack/react-query'
import { StateEnum } from 'qovery-typescript-axios'
import { queries } from '@qovery/state/util-queries'

interface ServiceDeploymentStatus {
  state: StateEnum
}

interface EnvironmentServiceStatuses {
  applications?: ServiceDeploymentStatus[]
  containers?: ServiceDeploymentStatus[]
  jobs?: ServiceDeploymentStatus[]
  helms?: ServiceDeploymentStatus[]
  databases?: ServiceDeploymentStatus[]
  terraforms?: ServiceDeploymentStatus[]
  agentic_workflows?: ServiceDeploymentStatus[]
}

interface UseOnboardingCompletionProps {
  projectIds: string[]
  enabled: boolean
}

export function hasAnyEnvironment(environmentsByProject: (readonly unknown[] | undefined)[]) {
  return environmentsByProject.some((environments) => Boolean(environments?.length))
}

export function hasAnyDeployedService(serviceStatusesByEnvironment: (EnvironmentServiceStatuses | undefined)[]) {
  return serviceStatusesByEnvironment.some((serviceStatuses) =>
    [
      ...(serviceStatuses?.applications ?? []),
      ...(serviceStatuses?.containers ?? []),
      ...(serviceStatuses?.jobs ?? []),
      ...(serviceStatuses?.helms ?? []),
      ...(serviceStatuses?.databases ?? []),
      ...(serviceStatuses?.terraforms ?? []),
      ...(serviceStatuses?.agentic_workflows ?? []),
    ].some(({ state }) => state === StateEnum.DEPLOYED)
  )
}

export function useOnboardingCompletion({ projectIds, enabled }: UseOnboardingCompletionProps) {
  const environmentQueries = useQueries({
    queries: projectIds.map((projectId) => ({
      ...queries.environments.list({ projectId }),
      enabled,
    })),
  })
  const environments = environmentQueries.flatMap(({ data }) => data ?? [])
  const serviceStatusQueries = useQueries({
    queries: environments.map(({ id: environmentId }) => ({
      ...queries.services.listStatuses(environmentId),
      enabled,
      refetchInterval: enabled ? 3000 : undefined,
    })),
  })

  return {
    hasEnvironment: hasAnyEnvironment(environmentQueries.map(({ data }) => data)),
    isServiceDeployed: hasAnyDeployedService(serviceStatusQueries.map(({ data }) => data)),
  }
}
