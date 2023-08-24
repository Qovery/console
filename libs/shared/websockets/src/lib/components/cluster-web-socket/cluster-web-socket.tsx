import { useQueryClient } from '@tanstack/react-query'
import { type Environment } from 'qovery-typescript-axios'
import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import useWebSocket from 'react-use-websocket'
import { applicationsActions, applicationsLoadingStatus } from '@qovery/domains/application'
import { databasesActions, databasesLoadingStatus } from '@qovery/domains/database'
import { updateEnvironmentsRunningStatus, useFetchEnvironments } from '@qovery/domains/environment'
import { type ServiceRunningStatus, type WebsocketRunningStatusInterface } from '@qovery/shared/interfaces'
import { type AppDispatch } from '@qovery/state/store'

export interface ClusterWebSocketProps {
  url: string
}

export function ClusterWebSocket(props: ClusterWebSocketProps) {
  const { url } = props
  const realUrl = new URL(url)
  const clusterId = realUrl.searchParams.get('cluster') || ''
  const { projectId = '' } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const queryClient = useQueryClient()

  const appsLoadingStatus = useSelector(applicationsLoadingStatus)
  const dbsLoadingStatus = useSelector(databasesLoadingStatus)

  const { lastMessage } = useWebSocket(url, {
    //Will attempt to reconnect on all close events, such as server shutting down
    shouldReconnect: () => false,
    share: true,
  })

  const { isLoading: envsLoadingStatus, data: environments } = useFetchEnvironments(projectId)

  const environmentsIdAssociatedToCluster = environments
    ?.filter((env: Environment) => {
      return env.cluster_id === clusterId
    })
    .map((env) => env.id)

  const storeEnvironmentRunningStatus = useCallback(
    (message: { environments: WebsocketRunningStatusInterface[] }): void => {
      updateEnvironmentsRunningStatus(queryClient, message.environments)
    },
    [queryClient]
  )

  const storeApplicationsRunningStatus = useCallback(
    (message: { environments: WebsocketRunningStatusInterface[] }, listEnvironmentIdFromCluster: string[]): void => {
      let runningApplication: ServiceRunningStatus[] = []
      message.environments.forEach((env) => {
        if (env.applications && env.applications.length) {
          runningApplication = [...runningApplication, ...env.applications]
        }
        if (env.containers && env.containers.length) {
          runningApplication = [...runningApplication, ...env.containers]
        }
        if (env.jobs && env.jobs.length) {
          runningApplication = [...runningApplication, ...env.jobs]
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

      storeEnvironmentRunningStatus(message)

      if (appsLoadingStatus === 'loaded') {
        environmentsIdAssociatedToCluster && storeApplicationsRunningStatus(message, environmentsIdAssociatedToCluster)
      }

      if (dbsLoadingStatus === 'loaded') {
        environmentsIdAssociatedToCluster && storeDatabasesRunningStatus(message, environmentsIdAssociatedToCluster)
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
