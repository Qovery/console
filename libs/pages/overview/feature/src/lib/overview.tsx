import { useEffect } from 'react'
import { Overview } from '@console/pages/overview/ui'
import { useAuth, useDocumentTitle } from '@console/shared/utils'
import { useUser } from '@console/domains/user'
import { useProjects } from '@console/domains/projects'
import { useParams } from 'react-router'

export function OverviewPage() {
  useDocumentTitle('Overview - Qovery')
  const { projects, getProjects } = useProjects()
  const { authLogout } = useAuth()
  const { userSignUp, getUserSignUp } = useUser()

  const { organizationId } = useParams()

  useEffect(() => {
    getUserSignUp()
    organizationId && getProjects(organizationId)
  }, [getProjects, organizationId, getUserSignUp])

  return <Overview projects={projects} authLogout={authLogout} user={userSignUp} />
}

export default OverviewPage
