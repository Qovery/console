import useWebSocket from 'react-use-websocket'
import { useCallback, useEffect } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@console/store/data'
import { applicationsActions, applicationsLoadingStatus } from '@console/domains/application'
import { ServiceRunningStatus, WebsocketRunningStatusInterface } from '@console/shared/interfaces'
import {
  environmentsActions,
  environmentsLoadingStatus,
  selectEnvironmentsIdByClusterId,
} from '@console/domains/environment'
import { databasesActions, databasesLoadingStatus } from '@console/domains/database'

export interface ClusterWebSocketProps {
  url: string
}

export function ClusterWebSocket(props: ClusterWebSocketProps) {
  const { url } = props
  const realUrl = new URL(url)
  const clusterId = realUrl.searchParams.get('cluster') || ''
  const dispatch = useDispatch<AppDispatch>()
  //const [clusterId, setClusterId] = useState('')
  const appsLoadingStatus = useSelector(applicationsLoadingStatus)
  const dbsLoadingStatus = useSelector(databasesLoadingStatus)
  const envsLoadingStatus = useSelector(environmentsLoadingStatus)

  const { lastMessage } = useWebSocket(url, {
    //Will attempt to reconnect on all close events, such as server shutting down
    shouldReconnect: (closeEvent) => false,
    share: true,
  })

  const environmentsIdAssociatedToCluster = useSelector(
    (state: RootState) => selectEnvironmentsIdByClusterId(state, clusterId),
    shallowEqual
  )

  const storeEnvironmentRunningStatus = useCallback(
    (message: { environments: WebsocketRunningStatusInterface[] }, clusterId: string): void => {
      dispatch(
        environmentsActions.updateEnvironmentsRunningStatus({ websocketRunningStatus: message.environments, clusterId })
      )
    },
    [dispatch]
  )

  const storeApplicationsRunningStatus = useCallback(
    (message: { environments: WebsocketRunningStatusInterface[] }, listEnvironmentIdFromCluster: string[]): void => {
      let runningApplication: ServiceRunningStatus[] = []
      message.environments.forEach((env) => {
        if (env.applications && env.applications.length) {
          runningApplication = [...runningApplication, ...env.applications]
        }
      })

      dispatch(
        applicationsActions.updateApplicationsRunningStatus({
          servicesRunningStatus: runningApplication,
          listEnvironmentIdFromCluster,
        })
      )
    },
    [dispatch]
  )

  const storeDatabasesRunningStatus = useCallback(
    (message: { environments: WebsocketRunningStatusInterface[] }, listEnvironmentIdFromCluster: string[]): void => {
      let runningDatabases: ServiceRunningStatus[] = []
      message.environments.forEach((env) => {
        if (env.databases && env.databases.length) {
          runningDatabases = [...runningDatabases, ...env.databases]
        }
      })

      dispatch(
        databasesActions.updateDatabasesRunningStatus({
          servicesRunningStatus: runningDatabases,
          listEnvironmentIdFromCluster,
        })
      )
    },
    [dispatch]
  )

  useEffect(() => {
    if (lastMessage !== null) {
      const message = JSON.parse(lastMessage.data) as { environments: WebsocketRunningStatusInterface[] }
      storeEnvironmentRunningStatus(message, clusterId)

      if (appsLoadingStatus === 'loaded') {
        storeApplicationsRunningStatus(message, environmentsIdAssociatedToCluster)
      }

      if (dbsLoadingStatus === 'loaded') {
        storeDatabasesRunningStatus(message, environmentsIdAssociatedToCluster)
      }
    }
  }, [
    dispatch,
    lastMessage,
    appsLoadingStatus,
    dbsLoadingStatus,
    envsLoadingStatus,
    clusterId,
    storeEnvironmentRunningStatus,
    storeApplicationsRunningStatus,
    storeDatabasesRunningStatus,
    environmentsIdAssociatedToCluster,
  ])

  return <div></div>
}
