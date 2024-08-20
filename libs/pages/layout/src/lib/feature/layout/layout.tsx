import { useAuth0 } from '@auth0/auth0-react'
import posthog from 'posthog-js'
import { type PropsWithChildren, memo, useEffect } from 'react'
import { redirect, useParams } from 'react-router-dom'
import { useIntercom } from 'react-use-intercom'
import { useClusters } from '@qovery/domains/clusters/feature'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { useOrganization, useOrganizations } from '@qovery/domains/organizations/feature'
import { ORGANIZATION_URL } from '@qovery/shared/routes'
import { StatusWebSocketListener } from '@qovery/shared/util-web-sockets'
import LayoutPage from '../../ui/layout-page/layout-page'
import { setCurrentOrganizationIdOnStorage, setCurrentProjectIdOnStorage, setCurrentProvider } from '../../utils/utils'

export interface LayoutProps {
  spotlight?: boolean
  topBar?: boolean
}

// XXX: Prevent web-socket invalidations when re-rendering
const StatusWebSocketListenerMemo = memo(StatusWebSocketListener)

export function Layout(props: PropsWithChildren<LayoutProps>) {
  const { children, spotlight, topBar } = props
  const { organizationId = '', projectId = '', environmentId = '', versionId } = useParams()
  const { user } = useAuth0()
  const { update: updateIntercom } = useIntercom()

  const { data: clusters = [] } = useClusters({ organizationId, enabled: !!organizationId })
  const { data: organizations = [] } = useOrganizations()
  const { refetch: fetchOrganization } = useOrganization({ organizationId, enabled: false })

  const { data: environment } = useEnvironment({ environmentId })

  useEffect(() => {
    const organizationIds = organizations.map(({ id }) => id)

    async function fetchOrganizationForQoveryTeam() {
      try {
        if (organizationId) {
          await fetchOrganization()
          redirect(ORGANIZATION_URL(organizationId))
        }
      } catch (error) {
        console.error(error)
        redirect(ORGANIZATION_URL(organizations[0].id))
      }
    }
    async function fetchOrganizationAndUpdateIntercom() {
      try {
        if (organizationId) {
          const { data: currentOrganization } = await fetchOrganization()
          updateIntercom({
            company: currentOrganization
              ? {
                  companyId: currentOrganization.id,
                  name: currentOrganization.name,
                }
              : undefined,
          })
        }
      } catch (error) {
        console.error(error)
      }
    }

    if (organizations.length > 0) {
      // fetch organization by id neccessary for debug by Qovery team
      if (!organizationIds.includes(organizationId)) {
        fetchOrganizationForQoveryTeam()
      } else {
        fetchOrganizationAndUpdateIntercom()
      }
    }
  }, [updateIntercom, organizationId, organizations, fetchOrganization])

  useEffect(() => {
    posthog.group('organization_id', organizationId)
    setCurrentOrganizationIdOnStorage(organizationId)
    setCurrentProjectIdOnStorage(projectId)
    setCurrentProvider(user?.sub ?? '')
  }, [user, organizationId, projectId])

  return (
    <LayoutPage spotlight={spotlight} topBar={topBar} clusters={clusters} defaultOrganizationId={organizations[0]?.id}>
      <>
        {
          /**
           * XXX: Here we are limited by the websocket API which requires a clusterId
           * We need to instantiate one hook per clusterId to get the complete environment statuses of the page
           */
          (environment ? [{ id: environment.cluster_id }] : clusters).map(
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
