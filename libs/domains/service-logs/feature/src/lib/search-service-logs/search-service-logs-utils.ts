import { type ServiceLogsParams } from '@qovery/shared/router'
import { type Option } from '@qovery/shared/ui'

export const VALID_FILTER_KEYS = ['level', 'instance', 'message', 'nginx', 'envoy', 'search', 'deploymentId']

export function mergeServiceLogsParams(
  currentParams: ServiceLogsParams,
  nextParams: ServiceLogsParams
): ServiceLogsParams {
  return {
    ...currentParams,
    ...nextParams,
  }
}

export function buildValueOptions(queryParams: ServiceLogsParams): Option[] {
  const options: Option[] = []

  if (queryParams.level) {
    const value = `level:${queryParams.level}`
    options.push({ value, label: value })
  }
  if (queryParams.instance) {
    const value = `instance:${queryParams.instance}`
    options.push({ value, label: value })
  }
  if (queryParams.container) {
    const value = `container:${queryParams.container}`
    options.push({ value, label: value })
  }
  if (queryParams.version) {
    const value = `version:${queryParams.version}`
    options.push({ value, label: value })
  }
  if (queryParams.message) {
    const value = `message:${queryParams.message}`
    options.push({ value, label: value })
  }
  if (queryParams.nginx) {
    const value = 'nginx:true'
    options.push({ value, label: value })
  }
  if (queryParams.envoy) {
    const value = 'envoy:true'
    options.push({ value, label: value })
  }
  if (queryParams.deploymentId) {
    const value = `deploymentId:${queryParams.deploymentId}`
    options.push({ value, label: value })
  }
  if (queryParams.search) {
    const value = queryParams.search
    options.push({ value, label: value })
  }

  return options
}

export function buildQueryParams(value: string) {
  const filterRegex = /(\w+)[:]([^\s]*)/g
  const matches = value.match(filterRegex)
  const queryParams: ServiceLogsParams = {
    level: undefined,
    instance: undefined,
    container: undefined,
    version: undefined,
    message: undefined,
    nginx: undefined,
    envoy: undefined,
    search: undefined,
    deploymentId: undefined,
  }

  if (matches) {
    matches.forEach((match) => {
      const parts = match.split(/[:]/)
      const filterKey = parts[0]
      const filterValue = parts[1] || ''

      const isValidFilter = VALID_FILTER_KEYS.includes(filterKey)

      if (isValidFilter && filterValue) {
        const typedQueryParams = queryParams as Record<string, string | boolean | undefined>
        typedQueryParams[filterKey] = filterValue
      }
      if (filterKey === 'nginx') {
        queryParams.nginx = true
      }
      if (filterKey === 'envoy') {
        queryParams.envoy = true
      }
    })
  }

  const textWithoutFilters = value.replace(filterRegex, '').trim()
  if (textWithoutFilters) {
    queryParams.search = textWithoutFilters
  }

  return queryParams
}
