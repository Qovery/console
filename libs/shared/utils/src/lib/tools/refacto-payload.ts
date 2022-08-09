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
  delete response['storage']
  delete response['running_status']
  delete response['maximum_cpu']
  delete response['maximum_memory']

  return refactoPayload(response)
}
