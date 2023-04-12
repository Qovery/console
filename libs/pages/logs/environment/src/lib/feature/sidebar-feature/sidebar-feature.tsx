import { DeploymentStageWithServicesStatuses } from 'qovery-typescript-axios'
import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import useWebSocket from 'react-use-websocket'
import { selectApplicationsEntitiesByEnvId } from '@qovery/domains/application'
import { selectDatabasesEntitiesByEnvId } from '@qovery/domains/database'
import { getEnvironmentById, useEnvironmentDeploymentHistory, useFetchEnvironments } from '@qovery/domains/environment'
import { useAuth } from '@qovery/shared/auth'
import { ApplicationEntity, DatabaseEntity } from '@qovery/shared/interfaces'
import { RootState } from '@qovery/store'
import Sidebar from '../../ui/sidebar/sidebar'

export interface SidebarFeatureProps {
  serviceId: string
}

export function SidebarFeature(props: SidebarFeatureProps) {
  const { serviceId } = props
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()

  const { data: environments } = useFetchEnvironments(projectId)
  const environment = getEnvironmentById(environmentId, environments)

  const applications = useSelector<RootState, ApplicationEntity[]>((state) =>
    selectApplicationsEntitiesByEnvId(state, environmentId)
  )
  const databases = useSelector<RootState, DatabaseEntity[]>((state) =>
    selectDatabasesEntitiesByEnvId(state, environmentId)
  )

  const { refetch, data: environmentDeploymentHistory } = useEnvironmentDeploymentHistory(projectId, environmentId)

  // fetch application deployments because if not currently deployed display a message
  useEffect(() => {
    const fetchEnv = () => refetch()
    !environmentDeploymentHistory && fetchEnv()
    const pullDeployments = setInterval(() => refetch(), 3000)

    return () => clearInterval(pullDeployments)
  }, [environmentDeploymentHistory, refetch, environmentId, projectId])

  const [statusStages, setStatusStages] = useState<DeploymentStageWithServicesStatuses[]>()

  const { getAccessTokenSilently } = useAuth()

  const deploymentStatusUrl: () => Promise<string> = useCallback(async () => {
    const url = `wss://ws.qovery.com/deployment/status?organization=${organizationId}&cluster=${environment?.cluster_id}&project=${projectId}&environment=${environmentId}`
    const token = await getAccessTokenSilently()

    return new Promise((resolve) => {
      environment?.cluster_id && resolve(url + `&bearer_token=${token}`)
    })
  }, [organizationId, environment?.cluster_id, projectId, environmentId, getAccessTokenSilently])

  useWebSocket(deploymentStatusUrl, {
    onMessage: (message) => setStatusStages(JSON.parse(message?.data).stages),
  })

  return (
    <Sidebar
      services={[...applications, ...databases]}
      serviceId={serviceId}
      statusStages={statusStages}
      environmentDeploymentHistory={environmentDeploymentHistory && environmentDeploymentHistory[0]}
    />
  )
}

export default SidebarFeature
