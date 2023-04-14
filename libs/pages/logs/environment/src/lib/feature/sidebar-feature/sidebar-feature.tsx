import { DeploymentStageWithServicesStatuses, EnvironmentStatus } from 'qovery-typescript-axios'
import { ApplicationEntity, DatabaseEntity } from '@qovery/shared/interfaces'
import Sidebar from '../../ui/sidebar/sidebar'

export interface SidebarFeatureProps {
  applications: ApplicationEntity[]
  databases: DatabaseEntity[]
  statusStages?: DeploymentStageWithServicesStatuses[]
  environmentStatus?: EnvironmentStatus
}

export function SidebarFeature(props: SidebarFeatureProps) {
  const { applications, databases, statusStages, environmentStatus } = props

  // const { refetch, data: environmentDeploymentHistory } = useEnvironmentDeploymentHistory(projectId, environmentId)

  // fetch application deployments because if not currently deployed display a message
  // useEffect(() => {
  //   const fetchEnv = () => refetch()
  //   !environmentDeploymentHistory && fetchEnv()
  //   const pullDeployments = setInterval(() => refetch(), 3000)

  //   return () => clearInterval(pullDeployments)
  // }, [environmentDeploymentHistory, refetch, environmentId, projectId])

  return (
    <Sidebar
      services={[...applications, ...databases]}
      statusStages={statusStages}
      environmentStatus={environmentStatus}
    />
  )
}

export default SidebarFeature
