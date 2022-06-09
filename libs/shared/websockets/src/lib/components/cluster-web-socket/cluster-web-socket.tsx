import useWebSocket from 'react-use-websocket'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '@console/store/data'
import { applicationsActions, applicationsLoadingStatus } from '@console/domains/application'
import { ServiceRunningStatus, WebsocketRunningStatusInterface } from '@console/shared/interfaces'
import {
  environmentsActions,
  environmentsLoadingStatus,
  selectEnvironmentsEntitiesByClusterId,
} from '@console/domains/environment'
import { databasesActions, databasesLoadingStatus } from '@console/domains/database'

export interface ClusterWebSocketProps {
  url: string
}

export function ClusterWebSocket(props: ClusterWebSocketProps) {
  const { url } = props
  const dispatch = useDispatch<AppDispatch>()
  const [clusterId, setClusterId] = useState('')
  const appsLoadingStatus = useSelector(applicationsLoadingStatus)
  const dbsLoadingStatus = useSelector(databasesLoadingStatus)
  const envsLoadingStatus = useSelector(environmentsLoadingStatus)

  const { lastMessage } = useWebSocket(url, {
    //Will attempt to reconnect on all close events, such as server shutting down
    shouldReconnect: (closeEvent) => false,
    share: true,
  })
  const environmentsAssociatedToCluster = useSelector(selectEnvironmentsEntitiesByClusterId(clusterId))

  useEffect(() => {
    if (url) {
      const realUrl = new URL(url)
      setClusterId(realUrl.searchParams.get('cluster') || '')
    }
  }, [])

  useEffect(() => {
    const storeEnvironmentRunningStatus = (
      message: { environments: WebsocketRunningStatusInterface[] },
      clusterId: string
    ): void => {
      dispatch(
        environmentsActions.updateEnvironmentsRunningStatus({ websocketRunningStatus: message.environments, clusterId })
      )
    }

    const storeApplicationsRunningStatus = (message: { environments: WebsocketRunningStatusInterface[] }): void => {
      let runningApplication: ServiceRunningStatus[] = []
      message.environments.forEach((env) => {
        if (env.applications && env.applications.length) {
          runningApplication = [...runningApplication, ...env.applications]
        }
      })

      dispatch(
        applicationsActions.updateApplicationsRunningStatus({
          servicesRunningStatus: runningApplication,
          listEnvironmentIdFromCluster: environmentsAssociatedToCluster.map((env) => env.id),
        })
      )
    }

    const storeDatabasesRunningStatus = (message: { environments: WebsocketRunningStatusInterface[] }): void => {
      let runningDatabases: ServiceRunningStatus[] = []
      message.environments.forEach((env) => {
        if (env.applications && env.applications.length) {
          runningDatabases = [...runningDatabases, ...env.applications]
        }
      })

      dispatch(
        databasesActions.updateDatabasessRunningStatus({
          servicesRunningStatus: runningDatabases,
          listEnvironmentIdFromCluster: environmentsAssociatedToCluster.map((env) => env.id),
        })
      )
    }

    if (lastMessage !== null) {
      const message = JSON.parse(lastMessage.data) as { environments: WebsocketRunningStatusInterface[] }
      storeEnvironmentRunningStatus(message, clusterId)

      if (appsLoadingStatus === 'loaded') {
        storeApplicationsRunningStatus(message)
      }

      if (dbsLoadingStatus === 'loaded') {
        storeDatabasesRunningStatus(message)
      }
    }
  }, [dispatch, lastMessage, appsLoadingStatus, dbsLoadingStatus, envsLoadingStatus, clusterId])

  return <div></div>
}
