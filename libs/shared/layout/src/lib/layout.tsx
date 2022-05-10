import { useEffect } from 'react'
import { useParams } from 'react-router'
import { useOrganization } from '@console/domains/organization'
import { selectProjectsEntitiesByOrgId, useEnvironments, useProjects } from '@console/domains/projects'
import { useUser } from '@console/domains/user'
import { selectApplicationById, useApplication, useApplications } from '@console/domains/application'
import { LayoutPage } from '@console/shared/ui'
import { useAuth } from '@console/shared/utils'
import { useSelector } from 'react-redux'

export interface LayoutProps {
  children: React.ReactElement
}

export function Layout(props: LayoutProps) {
  const { children } = props
  const { authLogout } = useAuth()
  const { organization, getOrganization } = useOrganization()
  const { getProjects } = useProjects()
  const { userSignUp, getUserSignUp } = useUser()
  const { environments, getEnvironments } = useEnvironments()
  const { applications, getApplications } = useApplications()
  const { getApplication } = useApplication()
  const { organizationId = '', projectId, environmentId, applicationId = '' } = useParams()
  const projects = useSelector((state) => selectProjectsEntitiesByOrgId(state, organizationId))

  const application = useSelector((state) => selectApplicationById(state, applicationId))

  useEffect(() => {
    getUserSignUp()
    getOrganization()
    organizationId && getProjects(organizationId)
    projectId && getEnvironments(projectId)
    environmentId && getApplications(environmentId)
    applicationId && getApplication(applicationId)
  }, [
    getProjects,
    getOrganization,
    organizationId,
    getUserSignUp,
    getEnvironments,
    projectId,
    environmentId,
    getApplications,
    applicationId,
    getApplication,
  ])

  return (
    <LayoutPage
      authLogout={authLogout}
      user={userSignUp}
      organizations={organization}
      projects={projects}
      environments={environments}
      applications={applications}
      application={application}
    >
      {children}
    </LayoutPage>
  )
}

export default Layout
