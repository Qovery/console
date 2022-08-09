import { ApplicationStorageStorage } from 'qovery-typescript-axios'

export function refactoPayload(response: any) {
  delete response['id']
  delete response['created_at']
  delete response['updated_at']

  return response
}

export function refactoApplicationPayload(response: any) {
  delete response['buildpack_language']
  delete response['environment']
  delete response['status']
  delete response['running_status']
  delete response['maximum_cpu']
  delete response['maximum_memory']

  // refacto because we can't send all git data
  response.git_repository = {
    url: response.git_repository.url,
    branch: response.git_repository.branch,
    root_path: response.git_repository.root_path,
  }

  // refacto to remove the id by storage
  response.storage =
    response.storage.length > 0
      ? response.storage.map((storage: ApplicationStorageStorage) => ({
          mount_point: storage.mount_point,
          size: storage.size,
          type: storage.type,
        }))
      : []

  return refactoPayload(response)
}
