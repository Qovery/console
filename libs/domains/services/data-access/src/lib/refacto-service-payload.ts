import {
  type ApplicationEditRequest,
  type ApplicationGitRepositoryRequest,
  type HelmRequest,
  type HelmResponseAllOfSourceOneOf,
  type HelmResponseAllOfSourceOneOf1,
  type ServiceStorageStorageInner,
} from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { type Application, type Helm } from './domains-services-data-access'

export function refactoApplication(application: Application) {
  // refacto because we can't send all git data
  if (application.git_repository) {
    application.git_repository = {
      url: application.git_repository.url,
      branch: application.git_repository.branch,
      root_path: application.git_repository.root_path,
      git_token_id: application.git_repository.git_token_id,
    }
  }

  // refacto to remove the id by storage
  if (application.storage) {
    application.storage =
      application.storage.length > 0
        ? application.storage.map((storage: ServiceStorageStorageInner) => ({
            mount_point: storage.mount_point,
            size: storage.size,
            type: storage.type,
            id: storage.id,
          }))
        : []
  }

  const applicationRequestPayload: ApplicationEditRequest = {
    name: application.name,
    storage: application.storage,
    cpu: application.cpu,
    git_repository: application.git_repository as ApplicationGitRepositoryRequest,
    build_mode: application.build_mode,
    description: application.description || undefined,
    memory: application.memory,
    auto_preview: application.auto_preview,
    auto_deploy: application.auto_deploy,
    ports: application.ports,
    dockerfile_path: application.dockerfile_path || undefined,
    healthchecks: application.healthchecks ?? {},
    buildpack_language: application.buildpack_language,
    max_running_instances: application.max_running_instances,
    min_running_instances: application.min_running_instances,
    entrypoint: application.entrypoint,
    arguments: application.arguments,
  }

  return applicationRequestPayload
}

export function refactoHelm(helm: Helm) {
  const sourceProvider = (helm.source as HelmResponseAllOfSourceOneOf).git ? 'GIT' : 'HELM_REPOSITORY'

  const source = match(sourceProvider)
    .with('GIT', () => {
      const gitRepository = (helm.source as HelmResponseAllOfSourceOneOf).git?.git_repository
      return {
        git_repository: {
          url: gitRepository?.url ?? '',
          branch: gitRepository?.branch,
          root_path: gitRepository?.root_path,
          git_token_id: gitRepository?.git_token_id,
        },
      }
    })
    .with('HELM_REPOSITORY', () => {
      const helmRepository = (helm.source as HelmResponseAllOfSourceOneOf1).repository
      return {
        helm_repository: {
          repository: helmRepository?.repository?.id,
          chart_name: helmRepository?.chart_name,
          chart_version: helmRepository?.chart_version,
        },
      }
    })
    .exhaustive()

  const helmRequestPayload: HelmRequest = {
    name: helm.name,
    description: helm.description,
    auto_preview: helm.auto_preview,
    auto_deploy: helm.auto_deploy,
    ports: helm.ports,
    allow_cluster_wide_resources: helm.allow_cluster_wide_resources,
    arguments: helm.arguments,
    values_override: helm.values_override,
    source,
  }

  return helmRequestPayload
}
