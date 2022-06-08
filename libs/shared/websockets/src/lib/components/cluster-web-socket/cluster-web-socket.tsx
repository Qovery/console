import useWebSocket from 'react-use-websocket'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '@console/store/data'
import { applicationsActions } from '@console/domains/application'
import { JsonValue } from 'react-use-websocket/dist/lib/types'
import { ServiceRunningStatus, WebsocketRunningStatusInterface } from '@console/shared/interfaces'
import { environmentsActions, selectEnvironmentsEntitiesByClusterId } from '@console/domains/environment'

export interface ClusterWebSocketProps {
  url: string
}

export function ClusterWebSocket(props: ClusterWebSocketProps) {
  const { url } = props
  const dispatch = useDispatch<AppDispatch>()
  const [clusterId, setClusterId] = useState('')

  const { lastMessage, getWebSocket } = useWebSocket<JsonValue>(url, {
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

    const storeApplicationsRunningStatus = (
      message: { environments: WebsocketRunningStatusInterface[] },
      clusterId: string
    ): void => {
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

    if (lastMessage !== null) {
      const message = JSON.parse(lastMessage.data) as { environments: WebsocketRunningStatusInterface[] }
      storeEnvironmentRunningStatus(message, clusterId)
      storeApplicationsRunningStatus(message, clusterId)
      //todo databases
    }
  }, [dispatch, lastMessage, getWebSocket])

  return <div></div>
}
