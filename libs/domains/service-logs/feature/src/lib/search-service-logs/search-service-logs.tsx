import { useCallback, useEffect, useRef, useState } from 'react'
import { type DecodedValueMap } from 'serialize-query-params'
import { useQueryParams } from 'use-query-params'
import { type AnyService } from '@qovery/domains/services/data-access'
import { Kbd, MultipleSelector, type MultipleSelectorRef, type Option } from '@qovery/shared/ui'
import { useFormatHotkeys } from '@qovery/shared/util-hooks'
import { useServiceInstances } from '../hooks/use-service-instances/use-service-instances'
import { useServiceLevels } from '../hooks/use-service-levels/use-service-levels'
import { queryParamsServiceLogs } from '../list-service-logs/service-logs-context/service-logs-context'

const VALID_FILTER_KEYS = ['level', 'instance', 'message', 'nginx', 'search']

function buildValueOptions(queryParams: DecodedValueMap<typeof queryParamsServiceLogs>): Option[] {
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
  if (queryParams.search) {
    const value = queryParams.search
    options.push({ value, label: value })
  }

  return options
}

function buildQueryParams(value: string) {
  const filterRegex = /(\w+)[:]([^\s]*)/g
  const matches = value.match(filterRegex)
  const queryParams: Omit<DecodedValueMap<typeof queryParamsServiceLogs>, 'startDate' | 'endDate'> = {
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
  service,
  clusterId,
  serviceId,
  isLoading,
}: {
  clusterId: string
  serviceId: string
  isLoading: boolean
  service?: AnyService
}) {
  const [queryParams, setQueryParams] = useQueryParams(queryParamsServiceLogs)
  const [options, setOptions] = useState<Option[]>(buildValueOptions(queryParams))
  const searchRef = useRef<MultipleSelectorRef>(null)
  const metaKey = useFormatHotkeys('meta')

  const serviceType = service?.serviceType

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

  // Add keyboard shortcut for Cmd/Ctrl+F to focus the search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'f') {
        if (document.activeElement !== searchRef.current?.input) {
          event.preventDefault()
          searchRef.current?.focus()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleChange = useCallback(
    (options: Option[]) => {
      setOptions(options)
      setQueryParams(buildQueryParams(options.map((option) => option.value).join(' ')))
    },
    [setQueryParams]
  )

  const defaultFilters = [
    ...(levels.length > 0
      ? [
          {
            value: 'level:',
            label: 'level:',
            description: levels.length > 0 ? `[${levels.join(', ')}]` : undefined,
            subOptions: levels.map((level) => ({
              value: `level:${level}`,
              label: level,
            })),
          },
        ]
      : []),
    {
      value: 'instance:',
      label: 'instance:',
      description: '[instance id]',
      subOptions: instances.map((instance) => ({
        value: `instance:${instance}`,
        label: instance,
      })),
    },
    ...(serviceType === 'HELM'
      ? [
          {
            value: 'container:',
            label: 'container:',
            description: '[container name]',
          },
        ]
      : []),
    {
      value: 'nginx:true',
      label: 'nginx:true',
      description: '[activate nginx logs]',
    },
  ]

  return (
    <div className="relative w-full">
      {isFetchedLevels && isFetchedInstances && (
        <>
          <MultipleSelector
            ref={searchRef}
            placeholder="Search logs and filter by message…"
            value={options}
            defaultOptions={defaultFilters}
            isLoading={isLoading}
            freeTextInput
            onChange={handleChange}
          />
          {options.length === 0 && searchRef.current?.input?.value?.length === 0 && (
            <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
              <Kbd className="w-4 items-center justify-center pt-[1px]">{metaKey}</Kbd>
              <Kbd className="w-4 items-center justify-center text-2xs">F</Kbd>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default SearchServiceLogs
