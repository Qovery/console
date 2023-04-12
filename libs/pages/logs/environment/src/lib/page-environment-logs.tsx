import equal from 'fast-deep-equal'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Route, Routes, useLocation, useParams } from 'react-router-dom'
import { fetchApplicationsStatus, selectApplicationsEntitiesByEnvId } from '@qovery/domains/application'
import { fetchDatabasesStatus, selectDatabasesEntitiesByEnvId } from '@qovery/domains/database'
import { getEnvironmentById, useFetchEnvironments } from '@qovery/domains/environment'
import { ApplicationEntity, DatabaseEntity } from '@qovery/shared/interfaces'
import { DEPLOYMENT_LOGS_URL, ENVIRONMENT_LOGS_URL, SERVICE_LOGS_URL } from '@qovery/shared/routes'
import { Icon, IconAwesomeEnum } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/utils'
import { AppDispatch, RootState } from '@qovery/store'
import DeploymentLogsFeature from './feature/deployment-logs-feature/deployment-logs-feature'
import PodLogsFeature from './feature/pod-logs-feature/pod-logs-feature'
import { ServiceStageIdsProvider } from './feature/service-stage-ids-context/service-stage-ids-context'
import SidebarFeature from './feature/sidebar-feature/sidebar-feature'

export function PageEnvironmentLogs() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()

  const dispatch = useDispatch<AppDispatch>()

  const { data: environments } = useFetchEnvironments(projectId)

  const environment = getEnvironmentById(environmentId, environments)
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

  // const [serviceId, setServiceId] = useState<string>('')
  // const [stageId, setStageId] = useState<string>('')

  useEffect(() => {
    const fetchServicesStatusByInterval = setInterval(() => {
      if (applications.length > 0) dispatch(fetchApplicationsStatus({ environmentId }))
      if (databases.length > 0) dispatch(fetchDatabasesStatus({ environmentId }))
    }, 2000)
    return () => clearInterval(fetchServicesStatusByInterval)
  }, [dispatch, environmentId, applications.length, databases.length])

  return (
    <div className="flex h-full">
      <ServiceStageIdsProvider>
        <SidebarFeature />
        <Routes>
          <Route
            path={DEPLOYMENT_LOGS_URL()}
            element={<DeploymentLogsFeature clusterId={environment?.cluster_id || ''} />}
          />
          <Route path={SERVICE_LOGS_URL()} element={<PodLogsFeature clusterId={environment?.cluster_id || ''} />} />
        </Routes>
      </ServiceStageIdsProvider>
      {(location.pathname === `${ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId)}/` ||
        location.pathname === ENVIRONMENT_LOGS_URL(organizationId, projectId, environmentId)) && (
        <div className="flex justify-center w-[calc(100%-8px)] min-h-full bg-element-light-darker-400 m-1 rounded">
          <div className="flex flex-col items-center mt-12">
            <Icon name={IconAwesomeEnum.WRENCH} className="text-text-300" />
            <p className="text-text-300 font-medium">
              Please select a service on the left menu to access its deployment logs or live logs
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default PageEnvironmentLogs
