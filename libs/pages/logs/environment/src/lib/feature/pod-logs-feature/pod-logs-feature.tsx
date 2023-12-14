import { type QueryClient } from '@tanstack/react-query'
import { DatabaseModeEnum } from 'qovery-typescript-axios'
import {
  type ServiceInfraLogResponseDto,
  type ServiceLogResponseDto,
  ServiceStateDto,
} from 'qovery-ws-typescript-axios'
import { memo, useCallback, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { match } from 'ts-pattern'
import { type Database } from '@qovery/domains/services/data-access'
import { useRunningStatus, useService } from '@qovery/domains/services/feature'
import { useDebounce, useDocumentTitle } from '@qovery/shared/util-hooks'
import { useReactQueryWsSubscription } from '@qovery/state/util-queries'
import _PodLogs from '../../ui/pod-logs/pod-logs'

export interface PodLogsFeatureProps {
  clusterId: string
}

const PodLogs = memo(_PodLogs)

export function PodLogsFeature({ clusterId }: PodLogsFeatureProps) {
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '' } = useParams()

  const debounceTime = 400
  const [pauseStatusLogs, setPauseStatusLogs] = useState<boolean>(false)
  const [enabledNginx, setEnabledNginx] = useState<boolean>(false)
  const [showPreviousLogs, setShowPreviousLogs] = useState<boolean>(false)
  const [serviceMessages, setServiceMessages] = useState<Array<ServiceLogResponseDto & { id: number }>>([])
  const debouncedServiceMessages = useDebounce(serviceMessages, debounceTime)
  const [infraMessages, setInfraMessages] = useState<Array<ServiceInfraLogResponseDto & { id: number }>>([])
  const debouncedInfraMessages = useDebounce(infraMessages, debounceTime)
  const logCounter = useRef(0)
  const now = useMemo(() => Date.now(), [])
  const logs = useMemo(
    () =>
      debouncedServiceMessages
        .concat(
          enabledNginx ? debouncedInfraMessages.map((message) => ({ ...message, version: '', pod_name: '' })) : []
        )
        .filter((log, index, array) => (showPreviousLogs || array.length - 1 === index ? true : log.created_at > now))
        .sort((a, b) => (a.created_at && b.created_at ? a.created_at - b.created_at : 0)),
    [debouncedServiceMessages, debouncedInfraMessages, enabledNginx, showPreviousLogs, now]
  )
  const debouncedLogs = useDebounce(logs, debounceTime)
  const pausedLogs = useMemo(() => debouncedLogs, [pauseStatusLogs])

  const { data: service } = useService({ environmentId, serviceId })
  const { data: runningStatus } = useRunningStatus({ environmentId, serviceId })

  useDocumentTitle(`Live logs ${service ? `- ${service?.name}` : '- Loading...'}`)

  const enabledLogs =
    service?.serviceType === 'DATABASE' ? (service as Database)?.mode === DatabaseModeEnum.CONTAINER : true

  const serviceMessageHandler = useCallback(
    (_: QueryClient, message: ServiceLogResponseDto) => {
      setServiceMessages((prevMessages) => [...prevMessages, { ...message, id: logCounter.current++ }])
    },
    [setServiceMessages]
  )

  useReactQueryWsSubscription({
    url: 'wss://ws.qovery.com/service/logs',
    urlSearchParams: {
      organization: organizationId,
      cluster: clusterId,
      project: projectId,
      environment: environmentId,
      service: serviceId,
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
      setInfraMessages((prevMessages) => [...prevMessages, { ...message, id: logCounter.current++ }])
    },
    [setInfraMessages]
  )

  useReactQueryWsSubscription({
    url: 'wss://ws.qovery.com/infra/logs',
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
    />
  )
}

export default PodLogsFeature
