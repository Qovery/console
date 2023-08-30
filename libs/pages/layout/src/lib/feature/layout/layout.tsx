import { type Cluster } from 'qovery-typescript-axios'
import { type PropsWithChildren, memo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { redirect, useParams } from 'react-router-dom'
import { fetchApplications } from '@qovery/domains/application'
import { fetchDatabases } from '@qovery/domains/database'
import {
  fetchClusters,
  fetchClustersStatus,
  fetchOrganization,
  fetchOrganizationById,
  selectAllOrganization,
  selectClustersEntitiesByOrganizationId,
} from '@qovery/domains/organization'
import { fetchProjects } from '@qovery/domains/projects'
import { type OrganizationEntity } from '@qovery/shared/interfaces'
import { ORGANIZATION_URL } from '@qovery/shared/routes'
import { StatusWebSocketListener } from '@qovery/shared/util-web-sockets'
import { type AppDispatch, type RootState } from '@qovery/state/store'
import LayoutPage from '../../ui/layout-page/layout-page'
import { setCurrentOrganizationIdOnStorage, setCurrentProjectIdOnStorage } from '../../utils/utils'

export interface LayoutProps {
  topBar?: boolean
}

// XXX: Prevent web-socket invalidations when re-rendering
const StatusWebSocketListenerMemo = memo(StatusWebSocketListener)

export function Layout(props: PropsWithChildren<LayoutProps>) {
  const { children, topBar } = props
  const { organizationId = '', projectId = '', environmentId = '', versionId } = useParams()

  const dispatch = useDispatch<AppDispatch>()

  const clusters = useSelector<RootState, Cluster[]>((state) =>
    selectClustersEntitiesByOrganizationId(state, organizationId)
  )
  const organizations = useSelector(selectAllOrganization)

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
            .catch(() => redirect(ORGANIZATION_URL(result[0].id))) // using redirect instead of navigate because navigate was needed in useEffect deps and retriggering everytime we change location https://github.com/remix-run/react-router/discussions/8465#discussioncomment-4051081
        }
      })
      .catch((error) => console.error(error))
  }, [dispatch, organizationId])

  useEffect(() => {
    if (environmentId) {
      dispatch(fetchApplications({ environmentId }))
      dispatch(fetchDatabases({ environmentId }))
    }
  }, [environmentId, dispatch])

  useEffect(() => {
    if (organizationId) {
      dispatch(fetchProjects({ organizationId }))
      dispatch(fetchClusters({ organizationId }))
      dispatch(fetchClustersStatus({ organizationId }))
    }
  }, [dispatch, organizationId])

  useEffect(() => {
    setCurrentOrganizationIdOnStorage(organizationId)
    setCurrentProjectIdOnStorage(projectId)
  }, [organizationId, projectId])

  return (
    <LayoutPage topBar={topBar} cluster={clusters[0]} defaultOrganizationId={organizations[0]?.id}>
      <>
        {
          /**
           * XXX: Here we are limited by the websocket API which requires a clusterId
           * We need to instantiate one hook per clusterId to get the complete environment statuses of the page
           */
          clusters.map(
            ({ id }) =>
              organizationId && (
                <StatusWebSocketListenerMemo
                  key={id}
                  organizationId={organizationId}
                  clusterId={id}
                  projectId={projectId}
                  environmentId={environmentId}
                  versionId={versionId}
                />
              )
          )
        }
        {children}
      </>
    </LayoutPage>
  )
}

export default Layout
