import { type Commit, type DeployAllRequest } from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import {
  type AnyService,
  isApplication,
  isBlueprintService,
  isContainer,
  isHelm,
  isJob,
} from '@qovery/domains/services/data-access'
import { isHelmGitSource, isHelmRepositorySource, isJobContainerSource, isJobGitSource } from '@qovery/shared/enums'

interface VersionedServiceBase {
  id: string
  name: string
  iconUri: string
  currentVersion?: string
  jobType?: 'CRON' | 'LIFECYCLE'
}

export type GitVersionedService = VersionedServiceBase & {
  sourceType: 'git'
  serviceType: 'APPLICATION' | 'JOB' | 'HELM' | 'TERRAFORM'
}

export type ContainerVersionedService = VersionedServiceBase & {
  sourceType: 'container'
  serviceType: 'CONTAINER' | 'JOB'
  containerRegistryId: string
  imageName: string
}

export type HelmRepositoryVersionedService = VersionedServiceBase & {
  sourceType: 'helm-repository'
  serviceType: 'HELM'
  helmRepositoryId: string
  chartName: string
}

export type VersionedService = GitVersionedService | ContainerVersionedService | HelmRepositoryVersionedService

export interface VersionOption {
  value: string
  message?: string
  tag?: string
}

export type DeployByVersionService = VersionedService & {
  versions: VersionOption[]
  isSkipped: boolean
  hasVersionError?: boolean
}

export interface ServiceVersionSelection {
  selected: boolean
  version: string
}

export type ServiceVersionSelections = Record<string, ServiceVersionSelection>

function baseService(service: AnyService): VersionedServiceBase {
  return {
    id: service.id,
    name: service.name,
    iconUri: service.icon_uri,
    jobType: isJob(service) ? service.job_type : undefined,
  }
}

export function toVersionedService(service: AnyService): VersionedService | undefined {
  // Blueprint-backed services are deployed through their blueprint flow.
  if (isBlueprintService(service)) return undefined

  if (isApplication(service)) {
    if (!service.git_repository) return undefined

    return {
      ...baseService(service),
      sourceType: 'git',
      serviceType: 'APPLICATION',
      currentVersion: service.git_repository.deployed_commit_id,
    }
  }

  if (isContainer(service)) {
    const containerRegistryId = service.registry_id ?? service.registry.id
    if (!containerRegistryId) return undefined

    return {
      ...baseService(service),
      sourceType: 'container',
      serviceType: 'CONTAINER',
      currentVersion: service.tag,
      containerRegistryId,
      imageName: service.image_name,
    }
  }

  if (isJob(service)) {
    if (isJobGitSource(service.source) && service.source.docker?.git_repository) {
      return {
        ...baseService(service),
        sourceType: 'git',
        serviceType: 'JOB',
        currentVersion: service.source.docker.git_repository.deployed_commit_id,
      }
    }

    if (isJobContainerSource(service.source)) {
      const containerRegistryId = service.source.image.registry_id ?? service.source.image.registry.id
      if (!containerRegistryId) return undefined

      return {
        ...baseService(service),
        sourceType: 'container',
        serviceType: 'JOB',
        currentVersion: service.source.image.tag,
        containerRegistryId,
        imageName: service.source.image.image_name,
      }
    }

    return undefined
  }

  if (isHelm(service)) {
    if (isHelmGitSource(service.source) && service.source.git?.git_repository) {
      return {
        ...baseService(service),
        sourceType: 'git',
        serviceType: 'HELM',
        currentVersion: service.source.git.git_repository.deployed_commit_id,
      }
    }

    if (isHelmRepositorySource(service.source) && service.source.repository) {
      return {
        ...baseService(service),
        sourceType: 'helm-repository',
        serviceType: 'HELM',
        currentVersion: service.source.repository.chart_version,
        helmRepositoryId: service.source.repository.repository.id,
        chartName: service.source.repository.chart_name,
      }
    }

    return undefined
  }

  if (service.serviceType === 'TERRAFORM') {
    const gitRepository = service.terraform_files_source?.git?.git_repository
    if (!gitRepository) return undefined

    return {
      ...baseService(service),
      sourceType: 'git',
      serviceType: 'TERRAFORM',
      currentVersion: gitRepository.deployed_commit_id,
    }
  }

  return undefined
}

export function commitsToVersionOptions(commits: Commit[]): VersionOption[] {
  return commits.map(({ git_commit_id, message, tag }) => ({
    value: git_commit_id,
    message,
    tag,
  }))
}

export function sortVersions(versions: string[]): string[] {
  const semanticVersion = /^v?\d+\.\d+\.\d+/

  return [...versions].sort((a, b) => {
    const aIsSemantic = semanticVersion.test(a)
    const bIsSemantic = semanticVersion.test(b)

    if (aIsSemantic && bIsSemantic) {
      return b.replace(/^v/i, '').localeCompare(a.replace(/^v/i, ''), undefined, { numeric: true })
    }
    if (aIsSemantic) return -1
    if (bIsSemantic) return 1
    return a.localeCompare(b)
  })
}

export function versionsToOptions(versions: string[]): VersionOption[] {
  return sortVersions(versions).map((value) => ({ value }))
}

export function createInitialSelections(services: DeployByVersionService[]): ServiceVersionSelections {
  return Object.fromEntries(
    services.map((service) => {
      const latestVersion = service.versions[0]?.value ?? ''
      return [
        service.id,
        {
          selected: !service.isSkipped && Boolean(latestVersion) && latestVersion !== service.currentVersion,
          version: latestVersion,
        },
      ]
    })
  )
}

export function buildDeployByVersionPayload(
  services: DeployByVersionService[],
  selections: ServiceVersionSelections
): DeployAllRequest {
  return services.reduce<DeployAllRequest>((payload, service) => {
    const selection = selections[service.id]
    if (!selection?.selected || !selection.version || service.isSkipped) return payload

    return match(service)
      .with({ serviceType: 'APPLICATION', sourceType: 'git' }, ({ id }) => ({
        ...payload,
        applications: [...(payload.applications ?? []), { application_id: id, git_commit_id: selection.version }],
      }))
      .with({ serviceType: 'CONTAINER', sourceType: 'container' }, ({ id }) => ({
        ...payload,
        containers: [...(payload.containers ?? []), { id, image_tag: selection.version }],
      }))
      .with({ serviceType: 'JOB', sourceType: 'git' }, ({ id }) => ({
        ...payload,
        jobs: [...(payload.jobs ?? []), { id, git_commit_id: selection.version }],
      }))
      .with({ serviceType: 'JOB', sourceType: 'container' }, ({ id }) => ({
        ...payload,
        jobs: [...(payload.jobs ?? []), { id, image_tag: selection.version }],
      }))
      .with({ serviceType: 'HELM', sourceType: 'git' }, ({ id }) => ({
        ...payload,
        helms: [...(payload.helms ?? []), { id, git_commit_id: selection.version }],
      }))
      .with({ serviceType: 'HELM', sourceType: 'helm-repository' }, ({ id }) => ({
        ...payload,
        helms: [...(payload.helms ?? []), { id, chart_version: selection.version }],
      }))
      .with({ serviceType: 'TERRAFORM', sourceType: 'git' }, ({ id }) => ({
        ...payload,
        terraforms: [...(payload.terraforms ?? []), { id, git_commit_id: selection.version }],
      }))
      .exhaustive()
  }, {})
}

export function countDeployByVersionServices(payload: DeployAllRequest): number {
  return (
    (payload.applications?.length ?? 0) +
    (payload.containers?.length ?? 0) +
    (payload.jobs?.length ?? 0) +
    (payload.helms?.length ?? 0) +
    (payload.terraforms?.length ?? 0)
  )
}
