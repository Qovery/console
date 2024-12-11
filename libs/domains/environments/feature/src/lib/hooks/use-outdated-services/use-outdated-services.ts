import { useQueries, useQuery } from '@tanstack/react-query'
import { type Commit } from 'qovery-typescript-axios'
import { P, match } from 'ts-pattern'
import { type Application, type Job, isApplication, isJob } from '@qovery/domains/services/data-access'
import { isJobGitSource } from '@qovery/shared/enums'
import { unionTypeGuard } from '@qovery/shared/util-types'
import { queries } from '@qovery/state/util-queries'

export interface UseOutdatedServicesProps {
  environmentId?: string
}

export type OutdatedService = (Application | Job) & { commits: Commit[] }

export function useOutdatedServices({ environmentId }: UseOutdatedServicesProps) {
  const { data: services = [], isLoading: isServicesLoading } = useQuery({
    ...queries.services.list(environmentId!),
    enabled: Boolean(environmentId),
  })

  const getGitRepository = (service: Application | Job) =>
    match(service)
      .with({ serviceType: 'APPLICATION' }, ({ git_repository }) => git_repository)
      .with({ serviceType: 'JOB', source: P.when(isJobGitSource) }, ({ source }) => source.docker?.git_repository)
      .otherwise(() => undefined)

  const gitServices = services
    .filter(unionTypeGuard([isApplication, isJob]))
    .filter((service) => Boolean(getGitRepository(service)))
  const queryResults = useQueries({
    queries: gitServices.map(({ id, serviceType }) => ({
      ...queries.services.listCommits({ serviceId: id, serviceType }),
    })),
  })

  const outdatedServices: OutdatedService[] = []

  for (let i = 0; i < queryResults.length; i++) {
    const { data: commits = [] } = queryResults[i]
    const service = gitServices[i]
    const gitRepository = getGitRepository(service)
    if (gitRepository?.deployed_commit_id !== commits[0]?.git_commit_id) {
      outdatedServices.push({
        ...service,
        commits,
      })
    }
  }

  return { data: outdatedServices, isLoading: queryResults.some(({ isLoading }) => isLoading) || isServicesLoading }
}

export default useOutdatedServices
