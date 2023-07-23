import equal from 'fast-deep-equal'
import { DeploymentStageWithServicesStatuses, EnvironmentLogs, EnvironmentStatus } from 'qovery-typescript-axios'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Route, Routes, useLocation, useParams } from 'react-router-dom'
import useWebSocket from 'react-use-websocket'
import { fetchApplicationsStatus, selectApplicationsEntitiesByEnvId } from '@qovery/domains/application'
import { fetchDatabasesStatus, selectDatabasesEntitiesByEnvId } from '@qovery/domains/database'
import { useFetchEnvironment } from '@qovery/domains/environment'
import { useAuth } from '@qovery/shared/auth'
import { ApplicationEntity, DatabaseEntity, LoadingStatus } from '@qovery/shared/interfaces'
import { DEPLOYMENT_LOGS_URL, ENVIRONMENT_LOGS_URL, SERVICE_LOGS_URL } from '@qovery/shared/routes'
import { Icon, IconAwesomeEnum } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store'
import DeploymentLogsFeature from './feature/deployment-logs-feature/deployment-logs-feature'
import PodLogsFeature from './feature/pod-logs-feature/pod-logs-feature'
import { ServiceStageIdsProvider } from './feature/service-stage-ids-context/service-stage-ids-context'
import Sidebar from './ui/sidebar/sidebar'

export function PageEnvironmentLogs() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()

  const dispatch = useDispatch<AppDispatch>()
  const { data: environment } = useFetchEnvironment(projectId, environmentId)

  const location = useLocation()

  useDocumentTitle(`Environment logs ${environment ? `- ${environment?.name}` : '- Loading...'}`)

  const applications = useSelector<RootState, ApplicationEntity[]>(
    (state) => selectApplicationsEntitiesByEnvId(state, environmentId),
    equal
  )
  const databases = useSelector<RootState, DatabaseEntity[]>(
    (state) => selectDatabasesEntitiesByEnvId(state, environmentId),
    equal
  )

  useEffect(() => {
    const fetchServicesStatusByInterval = setInterval(() => {
      if (applications.length > 0) dispatch(fetchApplicationsStatus({ environmentId }))
      if (databases.length > 0) dispatch(fetchDatabasesStatus({ environmentId }))
    }, 2000)
    return () => clearInterval(fetchServicesStatusByInterval)
  }, [dispatch, environmentId, applications.length, databases.length])

  const [statusStages, setStatusStages] = useState<DeploymentStageWithServicesStatuses[]>()
  const [environmentStatus, setEnvironmentStatus] = useState<EnvironmentStatus>()

  const { getAccessTokenSilently } = useAuth()

  const deploymentStatusUrl: () => Promise<string> = useCallback(async () => {
    const url = `wss://ws.qovery.com/deployment/status?organization=${organizationId}&cluster=${environment?.cluster_id}&project=${projectId}&environment=${environmentId}`
    const token = await getAccessTokenSilently()

    return new Promise((resolve) => {
      environment?.cluster_id && resolve(url + `&bearer_token=${token}`)
    })
  }, [organizationId, environment?.cluster_id, projectId, environmentId, getAccessTokenSilently])

  useWebSocket(deploymentStatusUrl, {
    onMessage: (message) => {
      setStatusStages(JSON.parse(message?.data).stages)
      setEnvironmentStatus(JSON.parse(message?.data).environment)
    },
  })

  const [messageChunks, setMessageChunks] = useState<EnvironmentLogs[][]>([])
  const chunkSize = 500
  const [debounceTime, setDebounceTime] = useState(1000)
  const [logs, setLogs] = useState<EnvironmentLogs[]>([])
  const [pauseStatusLogs, setPauseStatusLogs] = useState<boolean>(false)
  const [loadingStatusDeploymentLogs, setLoadingStatusDeploymentLogs] = useState<LoadingStatus>('not loaded')

  const deploymentLogsUrl: () => Promise<string> = useCallback(async () => {
    const url = `wss://ws.qovery.com/deployment/logs?organization=${organizationId}&cluster=${environment?.cluster_id}&project=${projectId}&environment=${environmentId}`
    const token = await getAccessTokenSilently()

    return new Promise((resolve) => {
      resolve(url + `&bearer_token=${token}`)
    })
  }, [organizationId, environment?.cluster_id, projectId, environmentId, getAccessTokenSilently])

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

  return (
    <div className="flex h-full">
      <ServiceStageIdsProvider>
        <Sidebar
          services={[...applications, ...databases]}
          statusStages={statusStages}
          environmentStatus={environmentStatus}
        />
        <Routes>
          <Route
            path={DEPLOYMENT_LOGS_URL()}
            element={
              <DeploymentLogsFeature
                logs={logs}
                pauseStatusLogs={pauseStatusLogs}
                setPauseStatusLogs={setPauseStatusLogs}
                loadingStatus={loadingStatusDeploymentLogs}
                statusStages={statusStages}
              />
            }
          />
          <Route path={SERVICE_LOGS_URL()} element={<PodLogsFeature clusterId={environment?.cluster_id || ''} />} />
        </Routes>
      </ServiceStageIdsProvider>
      {(location.pathname === `${ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId)}/` ||
        location.pathname === ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId)) && (
        <div className="flex justify-center w-[calc(100%-8px)] min-h-full bg-element-light-darker-400 m-1 rounded">
          <div className="flex flex-col items-center mt-12">
            <Icon name={IconAwesomeEnum.WRENCH} className="text-text-300" />
            <div className="text-text-300 font-medium">
              Please select a service on the left menu to access its deployment logs or live logs.
              <p>
                You can access the deployment logs only for the services recently deployed (
                <a className="text-brand-400">in purple</a>).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PageEnvironmentLogs
