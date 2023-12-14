import {
  type DeploymentStageWithServicesStatuses,
  type Environment,
  type EnvironmentLogs,
  type Status,
} from 'qovery-typescript-axios'
import { memo, useCallback, useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import useWebSocket from 'react-use-websocket'
import { match } from 'ts-pattern'
import { useEnvironmentDeploymentHistory } from '@qovery/domains/environment'
import { useDeploymentStatus, useService } from '@qovery/domains/services/feature'
import { useAuth } from '@qovery/shared/auth'
import { type LoadingStatus } from '@qovery/shared/interfaces'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import _DeploymentLogs from '../../ui/deployment-logs/deployment-logs'
import { ServiceStageIdsContext } from '../service-stage-ids-context/service-stage-ids-context'

export interface DeploymentLogsFeatureProps {
  environment: Environment
  statusStages?: DeploymentStageWithServicesStatuses[]
}

const DeploymentLogs = memo(_DeploymentLogs)

export function getServiceStatuesById(services?: DeploymentStageWithServicesStatuses[], serviceId = '') {
  if (services) {
    for (const service of services) {
      if (service.stage?.id === serviceId) {
        return service
      }
      if (service.applications && service.applications?.length > 0) {
        for (const application of service.applications) {
          if (application.id === serviceId) {
            return application
          }
        }
      }
      if (service.jobs && service.jobs?.length > 0) {
        for (const job of service.jobs) {
          if (job.id === serviceId) {
            return job
          }
        }
      }
      if (service.databases && service.databases?.length > 0) {
        for (const database of service.databases) {
          if (database.id === serviceId) {
            return database
          }
        }
      }
      if (service.containers && service.containers?.length > 0) {
        for (const container of service.containers) {
          if (container.id === serviceId) {
            return container
          }
        }
      }
      if (service.helms && service.helms?.length > 0) {
        for (const helms of service.helms) {
          if (helms.id === serviceId) {
            return helms
          }
        }
      }
    }
  }
  return null
}

export function DeploymentLogsFeature({ environment, statusStages }: DeploymentLogsFeatureProps) {
  const { organizationId = '', projectId = '', environmentId = '', serviceId = '', versionId = '' } = useParams()
  const { stageId } = useContext(ServiceStageIdsContext)

  const { data: service } = useService({ environmentId, serviceId })
  const { data: deploymentHistory } = useEnvironmentDeploymentHistory(projectId, environmentId)
  const { data: deploymentStatus } = useDeploymentStatus({ environmentId, serviceId })

  const [logs, setLogs] = useState<EnvironmentLogs[]>([])
  const [loadingStatusDeploymentLogs, setLoadingStatusDeploymentLogs] = useState<LoadingStatus>('not loaded')
  const [messageChunks, setMessageChunks] = useState<EnvironmentLogs[][]>([])
  const [debounceTime, setDebounceTime] = useState(1000)
  const [pauseStatusLogs, setPauseStatusLogs] = useState<boolean>(false)

  useDocumentTitle(
    `Deployment logs ${loadingStatusDeploymentLogs === 'loaded' ? `- ${service?.name}` : '- Loading...'}`
  )

  const { getAccessTokenSilently } = useAuth()
  const chunkSize = 500

  const deploymentLogsUrl: () => Promise<string> = useCallback(async () => {
    // reset current Logs
    setLogs([])

    const url = `wss://ws.qovery.com/deployment/logs?organization=${organizationId}&cluster=${environment?.cluster_id}&project=${projectId}&environment=${environmentId}&version=${versionId}`
    const token = await getAccessTokenSilently()

    return new Promise((resolve) => {
      environment?.cluster_id && resolve(url + `&bearer_token=${token}`)
    })
  }, [organizationId, environment?.cluster_id, projectId, environmentId, versionId, getAccessTokenSilently])

  useWebSocket(deploymentLogsUrl, {
    onMessage: (message) => {
      setLoadingStatusDeploymentLogs('loaded')

      const newLog = JSON.parse(message?.data)

      setMessageChunks((prevChunks) => {
        const lastChunk = prevChunks[prevChunks.length - 1] || []
        if (lastChunk.length < chunkSize) {
          return [...prevChunks.slice(0, -1), [...lastChunk, ...newLog]]
        } else {
          return [...prevChunks, [...newLog]]
        }
      })
    },
  })

  useEffect(() => {
    if (messageChunks.length === 0 || pauseStatusLogs) return

    const timerId = setTimeout(() => {
      if (!pauseStatusLogs) {
        setMessageChunks((prevChunks) => prevChunks.slice(1))
        setLogs((prevLogs) => {
          const combinedLogs = [...prevLogs, ...messageChunks[0]]
          return [...new Map(combinedLogs.map((item) => [item['timestamp'], item])).values()]
        })

        if (logs.length > 1000) {
          setDebounceTime(100)
        }
      }
    }, debounceTime)

    return () => {
      clearTimeout(timerId)
    }
  }, [messageChunks, pauseStatusLogs])

  const hideDeploymentLogsBoolean = !(getServiceStatuesById(statusStages, serviceId) as Status)?.is_part_last_deployment

  // Filter deployment logs by serviceId and stageId
  // Display entries when the name is "delete" or stageId is empty or equal with current stageId
  // Filter by the same transmitter ID and "Environment" or "TaskManager" type
  const logsByServiceId = logs.filter((currentData: EnvironmentLogs) => {
    const { stage, transmitter } = currentData.details
    const isDeleteStage = stage?.name === 'delete'
    const isEmptyOrEqualStageId = !stage?.id || stage?.id === stageId
    const isMatchingTransmitter =
      transmitter?.type === 'Environment' || transmitter?.type === 'TaskManager' || transmitter?.id === serviceId

    // Include the entry if any of the following conditions are true:
    // 1. The stage name is "delete".
    // 2. stageId is empty or equal with current stageId.
    // 3. The transmitter matches serviceId and has a type of "Environment" or "TaskManager".
    return (isDeleteStage || isEmptyOrEqualStageId) && isMatchingTransmitter
  })

  const errors = logsByServiceId
    .map((log: EnvironmentLogs, index: number) => ({
      index: index,
      errors: log.error,
    }))
    .filter((log) => log.errors)

  const isLastVersion = (deploymentHistory && deploymentHistory[0]?.id === versionId) || !versionId
  const isDeploymentProgressing: boolean = isLastVersion
    ? match(deploymentStatus?.state)
        .with(
          'BUILDING',
          'DEPLOYING',
          'CANCELING',
          'DELETING',
          'RESTARTING',
          'STOPPING',
          'QUEUED',
          'DELETE_QUEUED',
          'RESTART_QUEUED',
          'STOP_QUEUED',
          'DEPLOYMENT_QUEUED',
          () => true
        )
        .otherwise(() => false)
    : false

  return (
    <DeploymentLogs
      loadingStatus={loadingStatusDeploymentLogs}
      logs={logsByServiceId}
      errors={errors}
      pauseStatusLogs={pauseStatusLogs}
      setPauseStatusLogs={setPauseStatusLogs}
      serviceDeploymentStatus={(getServiceStatuesById(statusStages, serviceId) as Status)?.service_deployment_status}
      service={service}
      hideDeploymentLogs={hideDeploymentLogsBoolean}
      dataDeploymentHistory={deploymentHistory}
      isDeploymentProgressing={isDeploymentProgressing}
    />
  )
}

export default DeploymentLogsFeature
