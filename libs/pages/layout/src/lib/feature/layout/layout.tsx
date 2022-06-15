import { useEffect } from 'react'
import { useParams } from 'react-router'
import { fetchClusters, fetchOrganization } from '@console/domains/organization'
import { fetchProjects } from '@console/domains/projects'
import { useUser } from '@console/domains/user'
import { fetchApplications } from '@console/domains/application'
import { useAuth } from '@console/shared/auth'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@console/store/data'
import { WebsocketContainer } from '@console/shared/websockets'
import { fetchDatabases } from '@console/domains/database'
import LayoutPage from '../../ui/layout-page/layout-page'
import { fetchEnvironments } from '@console/domains/environment'

export interface LayoutProps {
  children: React.ReactElement
  darkMode?: boolean
}

export function Layout(props: LayoutProps) {
  const { children, darkMode } = props
  const { authLogout } = useAuth()
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const { userSignUp, getUserSignUp } = useUser()

  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    dispatch(fetchOrganization())
    getUserSignUp()
  }, [getUserSignUp, dispatch])

  useEffect(() => {
    if (environmentId) {
      dispatch(fetchApplications({ environmentId }))
      dispatch(fetchDatabases({ environmentId }))
    }
  }, [environmentId, dispatch])

  useEffect(() => {
    projectId && dispatch(fetchEnvironments({ projectId }))
  }, [projectId])

  useEffect(() => {
    if (organizationId) {
      dispatch(fetchProjects({ organizationId }))
      dispatch(fetchClusters({ organizationId }))
    }
  }, [dispatch, organizationId])

  return (
    <LayoutPage authLogout={authLogout} user={userSignUp} darkMode={darkMode}>
      <>
        <WebsocketContainer />
        {children}
      </>
    </LayoutPage>
  )
}

export default Layout
