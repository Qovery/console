import { useQueries, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { match } from 'ts-pattern'
import { queries } from '@qovery/state/util-queries'
import { useListDeploymentStages } from '../hooks/use-list-deployment-stages/use-list-deployment-stages'
import {
  type ContainerVersionedService,
  type DeployByVersionService,
  type GitVersionedService,
  type HelmRepositoryVersionedService,
  type VersionedService,
  commitsToVersionOptions,
  containerVersionsToOptions,
  toVersionedService,
  versionsToOptions,
} from './deploy-by-version'

interface UseDeployByVersionServicesProps {
  environmentId: string
  organizationId: string
}

const queryOptions = {
  staleTime: 3 * 60 * 1000,
  retry: false,
  retryOnMount: false,
  refetchOnWindowFocus: false,
} as const

function isGitService(service: VersionedService): service is GitVersionedService {
  return service.sourceType === 'git'
}

function isContainerService(service: VersionedService): service is ContainerVersionedService {
  return service.sourceType === 'container'
}

function isHelmRepositoryService(service: VersionedService): service is HelmRepositoryVersionedService {
  return service.sourceType === 'helm-repository'
}

export function useDeployByVersionServices({ environmentId, organizationId }: UseDeployByVersionServicesProps) {
  const servicesQuery = useQuery({
    ...queries.services.list(environmentId),
    refetchOnWindowFocus: false,
  })
  const deploymentStagesQuery = useListDeploymentStages({ environmentId })

  const versionedServices = useMemo(
    () => servicesQuery.data?.map(toVersionedService).filter((service) => service !== undefined) ?? [],
    [servicesQuery.data]
  )
  const gitServices = versionedServices.filter(isGitService)
  const containerServices = versionedServices.filter(isContainerService)
  const helmRepositoryServices = versionedServices.filter(isHelmRepositoryService)

  const gitQueries = useQueries({
    queries: gitServices.map((service) => ({
      ...match(service.serviceType)
        .with('HELM', () => queries.services.listCommits({ serviceId: service.id, serviceType: 'HELM', of: 'chart' }))
        .with('APPLICATION', () => queries.services.listCommits({ serviceId: service.id, serviceType: 'APPLICATION' }))
        .with('JOB', () => queries.services.listCommits({ serviceId: service.id, serviceType: 'JOB' }))
        .with('TERRAFORM', () => queries.services.listCommits({ serviceId: service.id, serviceType: 'TERRAFORM' }))
        .exhaustive(),
      ...queryOptions,
    })),
  })

  const containerQueries = useQueries({
    queries: containerServices.map(({ containerRegistryId, imageName }) => ({
      ...queries.organizations.containerVersions({ organizationId, containerRegistryId, imageName }),
      ...queryOptions,
    })),
  })

  const helmRepositoryQueries = useQueries({
    queries: helmRepositoryServices.map(({ helmRepositoryId, chartName }) => ({
      ...queries.serviceHelm.helmCharts({ organizationId, helmRepositoryId, chartName }),
      ...queryOptions,
    })),
  })

  const data = useMemo<DeployByVersionService[]>(() => {
    const skippedServiceIds = new Set(
      deploymentStagesQuery.data?.flatMap(({ services = [] }) =>
        services.filter(({ is_skipped }) => is_skipped).map(({ service_id }) => service_id)
      ) ?? []
    )

    const gitResults = new Map(gitServices.map((service, index) => [service.id, gitQueries[index]]))
    const containerResults = new Map(containerServices.map((service, index) => [service.id, containerQueries[index]]))
    const helmResults = new Map(
      helmRepositoryServices.map((service, index) => [service.id, helmRepositoryQueries[index]])
    )

    return versionedServices.map((service): DeployByVersionService => {
      const result = match(service)
        .with({ sourceType: 'git' }, ({ id }) => {
          const query = gitResults.get(id)
          return {
            versions: commitsToVersionOptions(query?.data ?? []),
            hasVersionError: query?.isError,
          }
        })
        .with({ sourceType: 'container' }, ({ id, imageName }) => {
          const query = containerResults.get(id)
          const versions = query?.data?.find(({ image_name }) => image_name === imageName)?.versions ?? []
          return {
            versions: containerVersionsToOptions(versions),
            hasVersionError: query?.isError,
          }
        })
        .with({ sourceType: 'helm-repository' }, ({ id, chartName }) => {
          const query = helmResults.get(id)
          const versions = query?.data?.find(({ chart_name }) => chart_name === chartName)?.versions ?? []
          return {
            versions: versionsToOptions(versions),
            hasVersionError: query?.isError,
          }
        })
        .exhaustive()

      return {
        ...service,
        ...result,
        isSkipped: skippedServiceIds.has(service.id),
      }
    })
  }, [
    containerQueries,
    containerServices,
    deploymentStagesQuery.data,
    gitQueries,
    gitServices,
    helmRepositoryQueries,
    helmRepositoryServices,
    versionedServices,
  ])

  return {
    data,
    isLoading:
      servicesQuery.isLoading ||
      deploymentStagesQuery.isLoading ||
      gitQueries.some(({ isLoading }) => isLoading) ||
      containerQueries.some(({ isLoading }) => isLoading) ||
      helmRepositoryQueries.some(({ isLoading }) => isLoading),
    isError: servicesQuery.isError || deploymentStagesQuery.isError,
  }
}
