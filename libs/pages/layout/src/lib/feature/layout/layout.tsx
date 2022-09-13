import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router'
import { fetchApplications } from '@qovery/domains/application'
import { fetchDatabases } from '@qovery/domains/database'
import { fetchEnvironments } from '@qovery/domains/environment'
import { fetchClusters, fetchOrganization } from '@qovery/domains/organization'
import { fetchProjects } from '@qovery/domains/projects'
import { fetchUserSignUp, selectUserSignUp } from '@qovery/domains/user'
import { WebsocketContainer } from '@qovery/shared/websockets'
import { AppDispatch } from '@qovery/store/data'
import LayoutPage from '../../ui/layout-page/layout-page'
import { setCurrentOrganizationIdOnStorage, setCurrentProjectIdOnStorage } from '../../utils/utils'

export interface LayoutProps {
  children: React.ReactElement
  darkMode?: boolean
  topBar?: boolean
}

export function Layout(props: LayoutProps) {
  const { children, darkMode, topBar } = props
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

  useEffect(() => {
    setCurrentOrganizationIdOnStorage(organizationId)
    setCurrentProjectIdOnStorage(projectId)
  }, [organizationId, projectId])

  return (
    <LayoutPage user={userSignUp} darkMode={darkMode} topBar={topBar}>
      <>
        <WebsocketContainer />
        {children}
      </>
    </LayoutPage>
  )
}

export default Layout
