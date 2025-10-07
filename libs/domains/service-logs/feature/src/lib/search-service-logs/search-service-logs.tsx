import { useCallback, useEffect, useState } from 'react'
import { type DecodedValueMap } from 'serialize-query-params'
import { useQueryParams } from 'use-query-params'
import { MultipleSelector, type Option } from '@qovery/shared/ui'
import { useServiceInstances } from '../hooks/use-service-instances/use-service-instances'
import { useServiceLevels } from '../hooks/use-service-levels/use-service-levels'
import { queryParamsServiceLogs } from '../list-service-logs/service-logs-context/service-logs-context'

const VALID_FILTER_KEYS = ['level', 'instance', 'version', 'message', 'nginx']

function buildValueOptions(queryParams: DecodedValueMap<typeof queryParamsServiceLogs>): Option[] {
  const options: Option[] = []

  if (queryParams.level) {
    options.push({ value: `level:${queryParams.level}`, label: `level:${queryParams.level}` })
  }
  if (queryParams.instance) {
    options.push({ value: `instance:${queryParams.instance}`, label: `instance:${queryParams.instance}` })
  }
  if (queryParams.container) {
    options.push({ value: `container:${queryParams.container}`, label: `container:${queryParams.container}` })
  }
  if (queryParams.version) {
    options.push({ value: `version:${queryParams.version}`, label: `version:${queryParams.version}` })
  }
  if (queryParams.message) {
    options.push({ value: `message:${queryParams.message}`, label: `message:${queryParams.message}` })
  }
  if (queryParams.nginx) {
    options.push({ value: 'nginx:true', label: 'nginx:true' })
  }
  if (queryParams.search) {
    options.push({ value: queryParams.search, label: queryParams.search })
  }

  return options
}

function buildQueryParams(value: string) {
  const filterRegex = /(\w+)[:]([^\s]*)/g
  const matches = value.match(filterRegex)
  const queryParams: DecodedValueMap<typeof queryParamsServiceLogs> = {
    startDate: undefined,
    endDate: undefined,
    level: undefined,
    instance: undefined,
    container: undefined,
    version: undefined,
    message: undefined,
    nginx: undefined,
    search: undefined,
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
    })
  }

  const textWithoutFilters = value.replace(filterRegex, '').trim()
  if (textWithoutFilters) {
    queryParams.search = textWithoutFilters
  }

  return queryParams
}

export function SearchServiceLogs({
  clusterId,
  serviceId,
  isLoading,
}: {
  clusterId: string
  serviceId: string
  isLoading: boolean
}) {
  const [queryParams, setQueryParams] = useQueryParams(queryParamsServiceLogs)
  const [options, setOptions] = useState<Option[]>(buildValueOptions(queryParams))

  const { data: levels = [], isFetched: isFetchedLevels } = useServiceLevels({
    clusterId,
    serviceId,
    enabled: Boolean(clusterId) && Boolean(serviceId),
  })

  const { data: instances = [], isFetched: isFetchedInstances } = useServiceInstances({
    clusterId,
    serviceId,
    enabled: Boolean(clusterId) && Boolean(serviceId),
  })

  // Sync the input value with query params only when query params change
  useEffect(() => {
    setOptions(buildValueOptions(queryParams))
  }, [queryParams])

  const handleChange = useCallback(
    (options: Option[]) => {
      setOptions(options)
      setQueryParams(buildQueryParams(options.map((option) => option.value).join(' ')))
    },
    [setQueryParams]
  )

  const defaultFilters = [
    {
      value: 'level:',
      label: 'level:',
      description: levels.length > 0 ? `[${levels.join(', ')}]` : undefined,
      subOptions: levels.map((level) => ({
        value: `level:${level}`,
        label: level,
      })),
    },
    {
      value: 'instance:',
      label: 'instance:',
      description: '[instance id]',
      subOptions: instances.map((instance) => ({
        value: `instance:${instance}`,
        label: instance,
      })),
    },
    {
      value: 'version:',
      label: 'version:',
      description: '[version name]',
    },
    {
      value: 'message:',
      label: 'message:',
      description: '[what you want to search for]',
    },
    {
      value: 'nginx:true',
      label: 'nginx:true',
      description: '[activate nginx logs]',
    },
  ]

  return (
    <div className="relative z-10 w-full">
      {isFetchedLevels && isFetchedInstances && (
        <MultipleSelector
          placeholder="Search logs…"
          value={options}
          defaultOptions={defaultFilters}
          isLoading={isLoading}
          freeTextInput
          onChange={handleChange}
        />
      )}
    </div>
  )
}

export default SearchServiceLogs
