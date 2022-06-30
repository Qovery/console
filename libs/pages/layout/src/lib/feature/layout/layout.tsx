import { useEffect } from 'react'
import { useParams } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { fetchClusters, fetchOrganization } from '@console/domains/organization'
import { fetchProjects } from '@console/domains/projects'
import { fetchUserSignUp, selectUserSignUp } from '@console/domains/user'
import { fetchApplications } from '@console/domains/application'
import { AppDispatch } from '@console/store/data'
import { WebsocketContainer } from '@console/shared/websockets'
import { fetchDatabases } from '@console/domains/database'
import { fetchEnvironments } from '@console/domains/environment'
import LayoutPage from '../../ui/layout-page/layout-page'

export interface LayoutProps {
  children: React.ReactElement
  darkMode?: boolean
}

export function Layout(props: LayoutProps) {
  const { children, darkMode } = props
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()
  const userSignUp = useSelector(selectUserSignUp)

  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    dispatch(fetchOrganization())
    dispatch(fetchUserSignUp())
  }, [dispatch])

  useEffect(() => {
    if (environmentId) {
      dispatch(fetchApplications({ environmentId }))
      dispatch(fetchDatabases({ environmentId }))
    }
  }, [environmentId, dispatch])

  useEffect(() => {
    projectId && dispatch(fetchEnvironments({ projectId }))
  }, [projectId, dispatch])

  useEffect(() => {
    if (organizationId) {
      dispatch(fetchProjects({ organizationId }))
      dispatch(fetchClusters({ organizationId }))
    }
  }, [dispatch, organizationId])

  return (
    <LayoutPage user={userSignUp} darkMode={darkMode}>
      <>
        <WebsocketContainer />
        {children}
      </>
    </LayoutPage>
  )
}

export default Layout
