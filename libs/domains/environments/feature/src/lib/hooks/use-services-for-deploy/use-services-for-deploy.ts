import { useQuery } from '@tanstack/react-query'
import { type ContainerRegistryProviderDetailsResponse, type ContainerSource } from 'qovery-typescript-axios'
import { useMemo } from 'react'
import {
  type AnyService,
  isApplication,
  isContainer,
  isDatabase,
  isHelm,
  isJob,
  type ServiceType,
} from '@qovery/domains/services/data-access'
import {
  isHelmGitSource,
  isHelmGitValuesOverride,
  isHelmRepositorySource,
  isJobContainerSource,
  isJobGitSource,
} from '@qovery/shared/enums'
import { queries } from '@qovery/state/util-queries'

export type VersionSourceType =
  | 'git' // Application, Job (docker), Helm (git), Terraform
  | 'container' // Container, Job (image)
  | 'helm-repository' // Helm (repository)
  | 'database' // No version selection

export type VersionType = 'commit' | 'tag' | 'chart-version'

export interface ServiceVersionInfo {
  type: VersionType
  value: string
  displayValue: string
}

export interface ServiceForDeploy {
  id: string
  name: string
  serviceType: ServiceType
  sourceType: VersionSourceType
  currentVersion?: ServiceVersionInfo

  // For containers/jobs with image source - registry info needed for version fetch
  containerSource?: ContainerSource

  // For Helm with repository source - chart info needed for version fetch
  helmRepository?: {
    repositoryId: string
    chartName: string
  }

  // For git-based services - needed for commit fetch
  gitRepository?: {
    deployedCommitId?: string
    deployedCommitDate?: string
  }

  // For Helm with git values override
  hasValuesOverrideGit?: boolean
}

function mapServiceToDeployInfo(service: AnyService): ServiceForDeploy {
  if (isApplication(service)) {
    const gitRepo = service.git_repository
    return {
      id: service.id,
      name: service.name,
      serviceType: 'APPLICATION',
      sourceType: 'git',
      currentVersion: gitRepo?.deployed_commit_id
        ? {
            type: 'commit',
            value: gitRepo.deployed_commit_id,
            displayValue: gitRepo.deployed_commit_id.slice(0, 7),
          }
        : undefined,
      gitRepository: gitRepo
        ? {
            deployedCommitId: gitRepo.deployed_commit_id,
            deployedCommitDate: gitRepo.deployed_commit_date,
          }
        : undefined,
    }
  }

  if (isContainer(service)) {
    return {
      id: service.id,
      name: service.name,
      serviceType: 'CONTAINER',
      sourceType: 'container',
      currentVersion: service.tag
        ? {
            type: 'tag',
            value: service.tag,
            displayValue: service.tag,
          }
        : undefined,
      containerSource: {
        image_name: service.image_name,
        tag: service.tag,
        registry: service.registry as ContainerRegistryProviderDetailsResponse,
      },
    }
  }

  if (isJob(service)) {
    const source = service.source
    if (isJobGitSource(source)) {
      const gitRepo = source.docker?.git_repository
      return {
        id: service.id,
        name: service.name,
        serviceType: 'JOB',
        sourceType: 'git',
        currentVersion: gitRepo?.deployed_commit_id
          ? {
              type: 'commit',
              value: gitRepo.deployed_commit_id,
              displayValue: gitRepo.deployed_commit_id.slice(0, 7),
            }
          : undefined,
        gitRepository: gitRepo
          ? {
              deployedCommitId: gitRepo.deployed_commit_id,
              deployedCommitDate: gitRepo.deployed_commit_date,
            }
          : undefined,
      }
    }

    if (isJobContainerSource(source)) {
      return {
        id: service.id,
        name: service.name,
        serviceType: 'JOB',
        sourceType: 'container',
        currentVersion: source.image?.tag
          ? {
              type: 'tag',
              value: source.image.tag,
              displayValue: source.image.tag,
            }
          : undefined,
        containerSource: source.image
          ? {
              image_name: source.image.image_name ?? '',
              tag: source.image.tag,
              registry: source.image.registry as ContainerRegistryProviderDetailsResponse,
            }
          : undefined,
      }
    }

    // Fallback for unknown job source
    return {
      id: service.id,
      name: service.name,
      serviceType: 'JOB',
      sourceType: 'git',
    }
  }

  if (isHelm(service)) {
    const source = service.source

    if (isHelmGitSource(source)) {
      const gitRepo = source.git?.git_repository
      return {
        id: service.id,
        name: service.name,
        serviceType: 'HELM',
        sourceType: 'git',
        currentVersion: gitRepo?.deployed_commit_id
          ? {
              type: 'commit',
              value: gitRepo.deployed_commit_id,
              displayValue: gitRepo.deployed_commit_id.slice(0, 7),
            }
          : undefined,
        gitRepository: gitRepo
          ? {
              deployedCommitId: gitRepo.deployed_commit_id,
              deployedCommitDate: gitRepo.deployed_commit_date,
            }
          : undefined,
        hasValuesOverrideGit: isHelmGitValuesOverride(service.values_override),
      }
    }

    if (isHelmRepositorySource(source)) {
      const repo = source.repository
      return {
        id: service.id,
        name: service.name,
        serviceType: 'HELM',
        sourceType: 'helm-repository',
        currentVersion: repo?.chart_version
          ? {
              type: 'chart-version',
              value: repo.chart_version,
              displayValue: repo.chart_version,
            }
          : undefined,
        helmRepository: repo?.repository?.id
          ? {
              repositoryId: repo.repository.id,
              chartName: repo.chart_name ?? '',
            }
          : undefined,
        hasValuesOverrideGit: isHelmGitValuesOverride(service.values_override),
      }
    }

    // Fallback for unknown helm source
    return {
      id: service.id,
      name: service.name,
      serviceType: 'HELM',
      sourceType: 'helm-repository',
    }
  }

  if (isDatabase(service)) {
    return {
      id: service.id,
      name: service.name,
      serviceType: 'DATABASE',
      sourceType: 'database',
      currentVersion: service.version
        ? {
            type: 'tag',
            value: service.version,
            displayValue: service.version,
          }
        : undefined,
    }
  }

  // Terraform
  const terraform = service
  const tfGitRepo = terraform.terraform_files_source?.git?.git_repository
  return {
    id: service.id,
    name: service.name,
    serviceType: 'TERRAFORM',
    sourceType: 'git',
    currentVersion: tfGitRepo?.deployed_commit_id
      ? {
          type: 'commit',
          value: tfGitRepo.deployed_commit_id,
          displayValue: tfGitRepo.deployed_commit_id.slice(0, 7),
        }
      : undefined,
    gitRepository: tfGitRepo
      ? {
          deployedCommitId: tfGitRepo.deployed_commit_id,
          deployedCommitDate: tfGitRepo.deployed_commit_date,
        }
      : undefined,
  }
}

export interface UseServicesForDeployProps {
  environmentId: string
}

export function useServicesForDeploy({ environmentId }: UseServicesForDeployProps) {
  const { data: services = [], isLoading } = useQuery({
    ...queries.services.list(environmentId),
    enabled: Boolean(environmentId),
  })

  const servicesForDeploy = useMemo(() => services.map(mapServiceToDeployInfo), [services])

  return {
    data: servicesForDeploy,
    isLoading,
  }
}

export default useServicesForDeploy
