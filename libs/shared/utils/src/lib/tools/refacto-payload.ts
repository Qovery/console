import {
  ApplicationEditRequest,
  ApplicationGitRepositoryRequest,
  DatabaseEditRequest,
  ServiceStorageStorage,
} from 'qovery-typescript-axios'
import { DatabaseEntity, GitApplicationEntity } from '@console/shared/interfaces'

export function refactoPayload(response: any) {
  delete response['id']
  delete response['created_at']
  delete response['updated_at']

  return response
}

export function refactoApplicationPayload(application: Partial<GitApplicationEntity>) {
  // refacto because we can't send all git data
  if (application.git_repository) {
    application.git_repository = {
      url: application.git_repository.url,
      branch: application.git_repository.branch,
      root_path: application.git_repository.root_path,
    }
  }

  // refacto to remove the id by storage
  if (application.storage) {
    application.storage =
      application.storage.length > 0
        ? application.storage.map((storage: ServiceStorageStorage) => ({
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
    ports: application.ports,
    dockerfile_path: application.dockerfile_path || undefined,
    healthcheck: application.healthcheck,
    buildpack_language: application.buildpack_language,
    max_running_instances: application.max_running_instances,
    min_running_instances: application.min_running_instances,
  }

  return applicationRequestPayload
}

export function refactoDatabasePayload(database: Partial<DatabaseEntity>) {
  const databaseRequestPayload: DatabaseEditRequest = {
    name: database.name,
    version: database.version,
    accessibility: database.accessibility,
    cpu: database.cpu,
    memory: database.memory,
    storage: database.storage,
  }

  return databaseRequestPayload
}
