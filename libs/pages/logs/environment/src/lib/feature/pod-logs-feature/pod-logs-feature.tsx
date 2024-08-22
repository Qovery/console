import { type QueryClient } from '@tanstack/react-query'
import { DatabaseModeEnum } from 'qovery-typescript-axios'
import {
  type ServiceInfraLogResponseDto,
  type ServiceLogResponseDto,
  ServiceStateDto,
} from 'qovery-ws-typescript-axios'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { useRunningStatus, useService } from '@qovery/domains/services/feature'
import { type TableFilterProps } from '@qovery/shared/ui'
import { useDebounce, useDocumentTitle } from '@qovery/shared/util-hooks'
import { QOVERY_WS } from '@qovery/shared/util-node-env'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'
import _PodLogs from '../../ui/pod-logs/pod-logs'

export interface PodLogsFeatureProps {
  clusterId: string
}

const PodLogs = memo(_PodLogs)

export function PodLogsFeature({ clusterId }: PodLogsFeatureProps) {
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = useParams()
  const [filter, setFilter] = useState<TableFilterProps[]>([])
  const [searchParams, setSearchParams] = useSearchParams()

  const POD_NAME_KEY = 'pod_name'
  useEffect(() => {
    const podFilter = filter.find(({ key }) => key === POD_NAME_KEY)
    const searchParamValue = searchParams.get(POD_NAME_KEY)

    if (podFilter?.value) {
      if (podFilter.value !== 'ALL') {
        if (searchParams.get(POD_NAME_KEY) !== podFilter.value) {
          setSearchParams((params) => {
            params.set(POD_NAME_KEY, podFilter.value!)
            return params
          })
        }
      } else {
        setSearchParams((params) => {
          params.delete(POD_NAME_KEY)
          return params
        })
      }
    } else if (searchParamValue) {
      setFilter((filter) => {
        const podFilter = filter.find(({ key }) => key === POD_NAME_KEY)
        if (podFilter) {
          return filter.map((f) => (f.key === POD_NAME_KEY ? { key: f.key, value: searchParamValue } : f))
        } else {
          return [...filter, { key: POD_NAME_KEY, value: searchParamValue }]
        }
      })
    }
  }, [searchParams, setSearchParams, filter, setFilter])

  const debounceTime = 400
  const [pauseStatusLogs, setPauseStatusLogs] = useState<boolean>(false)
  const [enabledNginx, setEnabledNginx] = useState<boolean>(false)
  const [showPreviousLogs, setShowPreviousLogs] = useState<boolean>(false)
  const [newMessagesAvailable, setNewMessagesAvailable] = useState(false)
  const [serviceMessages, setServiceMessages] = useState<Array<ServiceLogResponseDto & { id: number }>>([])
  const debouncedServiceMessages = useDebounce(serviceMessages, debounceTime)
  const [infraMessages, setInfraMessages] = useState<Array<ServiceInfraLogResponseDto & { id: number }>>([])
  const debouncedInfraMessages = useDebounce(infraMessages, debounceTime)
  const logCounter = useRef(0)
  const now = useMemo(() => Date.now(), [])
  const OFFSET = 20
  const logs = useMemo(() => {
    const podFilter = filter.find(({ key }) => key === POD_NAME_KEY)
    return debouncedServiceMessages
      .filter(({ pod_name }) => (podFilter && podFilter.value !== 'ALL' ? podFilter.value === pod_name : true))
      .concat(
        enabledNginx
          ? debouncedInfraMessages.map((message) => ({ version: '', pod_name: '', container_name: '', ...message }))
          : []
      )
      .filter((log, index, array) =>
        showPreviousLogs || array.length - 1 - OFFSET <= index ? true : log.created_at > now
      )
      .sort((a, b) => (a.created_at && b.created_at ? a.created_at - b.created_at : 0))
  }, [debouncedServiceMessages, debouncedInfraMessages, enabledNginx, showPreviousLogs, now, filter])
  const debouncedLogs = useDebounce(logs, debounceTime)
  const pausedLogs = useMemo(() => debouncedLogs, [pauseStatusLogs])

  const { data: service } = useService({ environmentId, serviceId })
  const { data: runningStatus } = useRunningStatus({ environmentId, serviceId })

  useDocumentTitle(`Live logs ${service ? `- ${service?.name}` : '- Loading...'}`)

  const enabledLogs = service?.serviceType === 'DATABASE' ? service?.mode === DatabaseModeEnum.CONTAINER : true

  const serviceMessageHandler = useCallback(
    (_: QueryClient, message: ServiceLogResponseDto) => {
      setNewMessagesAvailable(true)
      setServiceMessages((prevMessages) => [...prevMessages, { ...message, id: logCounter.current++ }])
    },
    [setServiceMessages]
  )

  useReactQueryWsSubscription({
    url: QOVERY_WS + '/service/logs',
    urlSearchParams: {
      organization: organizationId,
      cluster: clusterId,
      project: projectId,
      environment: environmentId,
      service: serviceId,
      pod_name: searchParams.get(POD_NAME_KEY) ?? undefined,
    },
    enabled:
      Boolean(organizationId) &&
      Boolean(clusterId) &&
      Boolean(projectId) &&
      Boolean(environmentId) &&
      Boolean(serviceId) &&
      enabledLogs,
    onMessage: serviceMessageHandler,
  })

  const infraMessageHandler = useCallback(
    (_: QueryClient, message: ServiceInfraLogResponseDto) => {
      setNewMessagesAvailable(true)
      setInfraMessages((prevMessages) => [...prevMessages, { ...message, id: logCounter.current++ }])
    },
    [setInfraMessages]
  )

  useReactQueryWsSubscription({
    url: QOVERY_WS + '/infra/logs',
    urlSearchParams: {
      organization: organizationId,
      cluster: clusterId,
      project: projectId,
      environment: environmentId,
      service: serviceId,
      infra_component_type: 'NGINX',
    },
    enabled:
      Boolean(organizationId) &&
      Boolean(clusterId) &&
      Boolean(projectId) &&
      Boolean(environmentId) &&
      Boolean(serviceId) &&
      enabledLogs &&
      enabledNginx,
    onMessage: infraMessageHandler,
  })

  const isProgressing = match(runningStatus?.state)
    .with(ServiceStateDto.RUNNING, ServiceStateDto.WARNING, () => true)
    .otherwise(() => false)

  return (
    <PodLogs
      service={service}
      loadingStatus={debouncedLogs.length !== 0 ? 'loaded' : 'loading'}
      logs={pauseStatusLogs ? pausedLogs : debouncedLogs}
      pauseStatusLogs={pauseStatusLogs}
      setPauseStatusLogs={setPauseStatusLogs}
      enabledNginx={enabledNginx}
      setEnabledNginx={setEnabledNginx}
      showPreviousLogs={showPreviousLogs}
      setShowPreviousLogs={setShowPreviousLogs}
      countNginx={infraMessages.length}
      isProgressing={isProgressing}
      filter={filter}
      setFilter={setFilter}
      newMessagesAvailable={newMessagesAvailable}
      setNewMessagesAvailable={setNewMessagesAvailable}
    />
  )
}

export default PodLogsFeature
