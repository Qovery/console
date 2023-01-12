import { Cluster } from 'qovery-typescript-axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchApplications } from '@qovery/domains/application'
import { fetchDatabases } from '@qovery/domains/database'
import { fetchEnvironments } from '@qovery/domains/environment'
import {
  fetchClusters,
  fetchOrganization,
  fetchOrganizationById,
  selectClustersEntitiesByOrganizationId,
} from '@qovery/domains/organization'
import { fetchProjects } from '@qovery/domains/projects'
import { fetchUserSignUp } from '@qovery/domains/user'
import { OrganizationEntity } from '@qovery/shared/interfaces'
import { ORGANIZATION_URL } from '@qovery/shared/routes'
import { WebsocketContainer } from '@qovery/shared/websockets'
import { AppDispatch, RootState } from '@qovery/store'
import LayoutPage from '../../ui/layout-page/layout-page'
import { setCurrentOrganizationIdOnStorage, setCurrentProjectIdOnStorage } from '../../utils/utils'

export interface LayoutProps {
  children: React.ReactElement
  topBar?: boolean
}

export function Layout(props: LayoutProps) {
  const { children, topBar } = props
  const { organizationId = '', projectId = '', environmentId = '' } = useParams()

  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const clusters = useSelector<RootState, Cluster[]>((state) =>
    selectClustersEntitiesByOrganizationId(state, organizationId)
  )

  useEffect(() => {
    dispatch(fetchOrganization())
      .unwrap()
      .then((result: OrganizationEntity[]) => {
        const organizationIds: string[] = []

        for (let i = 0; i < result.length; i++) {
          const organization = result[i]
          organizationIds.push(organization.id)
        }

        // fetch organization by id neccessary for debug by Qovery team
        if (result.length > 0 && !organizationIds.includes(organizationId)) {
          dispatch(fetchOrganizationById({ organizationId }))
            .unwrap()
            .catch(() => navigate(ORGANIZATION_URL(result[0].id)))
        }
      })
      .catch((error) => console.error(error))

    dispatch(fetchUserSignUp())
  }, [dispatch, organizationId, navigate])

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
    <LayoutPage topBar={topBar} cluster={clusters[0]}>
      <>
        <WebsocketContainer />
        {children}
      </>
    </LayoutPage>
  )
}

export default Layout
