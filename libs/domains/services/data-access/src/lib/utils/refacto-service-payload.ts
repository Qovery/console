import {
  type ApplicationEditRequest,
  type ApplicationGitRepositoryRequest,
  DatabaseModeEnum,
  type HelmRequest,
  type HelmResponseAllOfSourceOneOf,
  type HelmResponseAllOfSourceOneOf1,
  type ServiceStorageStorageInner,
} from 'qovery-typescript-axios'
import { match } from 'ts-pattern'
import { isJobGitSource } from '@qovery/shared/enums'
import { type Application, type Container, type Database, type Helm, type Job } from '../domains-services-data-access'

/* 
TODO: all this following functions should be removed after the API refactoring and we need to clean it after the Services migration to React Query 
https://www.notion.so/qovery/API-improvements-b54ba305c2ee4e549eb002278c532c7f?pvs=4#7d71ea23b5fa44ca80c15a0c32ebd8da
*/

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

export function refactoContainer(container: Container) {
  const containerRequestPayload = {
    name: container.name || '',
    description: container.description || '',
    storage: container.storage,
    ports: container.ports,
    cpu: container.cpu,
    memory: container.memory,
    max_running_instances: container.max_running_instances,
    min_running_instances: container.min_running_instances,
    registry_id: container.registry?.id || '',
    image_name: container.image_name || '',
    tag: container.tag || '',
    arguments: container.arguments,
    entrypoint: container.entrypoint,
    auto_preview: container.auto_preview,
    auto_deploy: container.auto_deploy,
    healthchecks: container.healthchecks,
  }

  return containerRequestPayload
}

export function refactoJob(job: Job) {
  const jobRequest = {
    name: job.name,
    description: job.description,
    cpu: job.cpu,
    memory: job.memory,
    auto_preview: job.auto_preview,
    auto_deploy: job.auto_deploy,
    max_duration_seconds: job.max_duration_seconds,
    port: job.port,
    max_nb_restart: job.max_nb_restart,
    schedule: job.schedule,
    healthchecks: job.healthchecks ?? {},
    source: {},
  }

  if (isJobGitSource(job.source)) {
    jobRequest.source = {
      docker: {
        dockerfile_path: job.source.docker?.dockerfile_path,
        git_repository: {
          url: job.source.docker?.git_repository?.url || '',
          branch: job.source.docker?.git_repository?.branch,
          root_path: job.source.docker?.git_repository?.root_path,
          git_token_id: job.source.docker?.git_repository?.git_token_id,
        },
      },
    }
  } else {
    jobRequest.source = {
      image: {
        registry_id: job.source?.image?.registry_id,
        image_name: job.source?.image?.image_name,
        tag: job.source?.image?.tag,
      },
    }
  }

  return jobRequest
}

export function refactoDatabase(database: Database) {
  const databaseRequestPayload = {
    name: database.name,
    description: database.description,
    version: database.version,
    accessibility: database.accessibility,
    cpu: database.cpu,
    memory: database.memory,
    storage: database.storage,
    instance_type: database.instance_type,
  }

  if (database.mode === DatabaseModeEnum.MANAGED) databaseRequestPayload.version = database.version

  return databaseRequestPayload
}

export function refactoHelm(helm: Helm) {
  const sourceProvider = (helm?.source as HelmResponseAllOfSourceOneOf).git ? 'GIT' : 'HELM_REPOSITORY'

  const source = match(sourceProvider)
    .with('GIT', () => {
      const gitRepository = (helm?.source as HelmResponseAllOfSourceOneOf).git?.git_repository
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
      const helmRepository = (helm?.source as HelmResponseAllOfSourceOneOf1).repository
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
