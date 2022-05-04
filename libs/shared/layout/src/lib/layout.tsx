import { useEffect } from 'react'
import { useParams } from 'react-router'
import { useOrganization } from '@console/domains/organization'
import { useEnviroments, useProjects } from '@console/domains/projects'
import { useUser } from '@console/domains/user'
import { useApplication, useApplications } from '@console/domains/application'
import { LayoutPage } from '@console/shared/ui'
import { useAuth } from '@console/shared/utils'

export interface LayoutProps {
  children: React.ReactElement
}

export function Layout(props: LayoutProps) {
  const { children } = props
  const { authLogout } = useAuth()
  const { organization, getOrganization } = useOrganization()
  const { projects, getProjects } = useProjects()
  const { userSignUp, getUserSignUp } = useUser()
  const { environments, getEnvironments } = useEnviroments()
  const { applications, getApplications } = useApplications()
  const { application, getApplication } = useApplication()
  const { organizationId, projectId, environmentId, applicationId } = useParams()

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
      application={application(applicationId || '')}
    >
      {children}
    </LayoutPage>
  )
}

export default Layout
