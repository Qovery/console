import { useEffect } from 'react'
import { useParams } from 'react-router'
import { fetchClusters, useOrganization } from '@console/domains/organization'
import { selectProjectsEntitiesByOrgId, useEnvironments, useProjects } from '@console/domains/projects'
import { useUser } from '@console/domains/user'
import { selectApplicationById, useApplication, useApplications } from '@console/domains/application'
import { LayoutPage } from '@console/shared/ui'
import { useAuth } from '@console/shared/auth'
import { useDispatch, useSelector } from 'react-redux'
import { selectEnvironmentsEntitiesByProjectId } from '@console/domains/environment'
import { Application, Environment, Project } from 'qovery-typescript-axios'
import { AppDispatch, RootState } from '@console/store/data'
import { WebsocketContainer } from '@console/shared/websockets'
import { fetchDatabases, selectAllDatabases } from '@console/domains/database'

export interface LayoutProps {
  children: React.ReactElement
}

export function Layout(props: LayoutProps) {
  const { children } = props
  const { authLogout } = useAuth()
  const { organizationId = '', projectId = '', environmentId = '', applicationId = '' } = useParams()
  const { organization, getOrganization } = useOrganization()
  const { getProjects } = useProjects()
  const { userSignUp, getUserSignUp } = useUser()
  const { getEnvironments } = useEnvironments()
  const environments = useSelector<RootState, Environment[]>((state) =>
    selectEnvironmentsEntitiesByProjectId(state, projectId)
  )
  const { applications, getApplications } = useApplications()
  const databases = useSelector(selectAllDatabases)
  const { getApplication } = useApplication()
  const projects = useSelector<RootState, Project[]>((state) => selectProjectsEntitiesByOrgId(state, organizationId))
  const application = useSelector<RootState, Application | undefined>((state) =>
    selectApplicationById(state, applicationId)
  )

  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    getUserSignUp()
    getOrganization()
    organizationId && getProjects(organizationId)
    projectId && getEnvironments(projectId)
    environmentId && getApplications(environmentId)
    environmentId && dispatch(fetchDatabases({ environmentId }))
  }, [
    getProjects,
    getOrganization,
    organizationId,
    getUserSignUp,
    getEnvironments,
    projectId,
    environmentId,
    getApplications,
    getApplication,
    dispatch,
  ])

  useEffect(() => {
    dispatch(fetchClusters({ organizationId }))
  }, [organizationId])

  return (
    <LayoutPage
      authLogout={authLogout}
      user={userSignUp}
      organizations={organization}
      projects={projects}
      environments={environments}
      applications={applications}
      application={application}
      databases={databases}
    >
      <>
        <WebsocketContainer />
        {children}
      </>
    </LayoutPage>
  )
}

export default Layout
