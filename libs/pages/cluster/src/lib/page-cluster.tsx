import { useContext, useEffect } from 'react'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { useCluster, useDeployCluster } from '@qovery/domains/clusters/feature'
import { AUDIT_LOGS_PARAMS_URL, CLUSTER_SETTINGS_URL, CLUSTER_URL, INFRA_LOGS_URL } from '@qovery/shared/routes'
import { SpotlightContext } from '@qovery/shared/spotlight/feature'
import { ROUTER_CLUSTER } from './router/router'
import Container from './ui/container/container'

export function PagesCluster() {
  const { organizationId = '', clusterId = '' } = useParams()

  const { data: cluster } = useCluster({ organizationId, clusterId })
  const { mutate: deployCluster } = useDeployCluster()

  const { setQuickActions } = useContext(SpotlightContext)
  useEffect(() => {
    if (!clusterId) {
      return
    }

    setQuickActions([
      { label: 'See logs', iconName: 'scroll', link: INFRA_LOGS_URL(organizationId, clusterId) },
      {
        label: 'See audit logs',
        iconName: 'clock-rotate-left',
        link: AUDIT_LOGS_PARAMS_URL(organizationId, {
          targetType: 'CLUSTER',
          targetId: clusterId,
        }),
      },
    ])
  }, [clusterId, organizationId])

  return (
    <Container
      cluster={cluster}
      deployCluster={() =>
        deployCluster({
          organizationId,
          clusterId,
        })
      }
    >
      <Routes>
        {ROUTER_CLUSTER.map((route) => (
          <Route key={route.path} path={route.path} element={route.component} />
        ))}
        <Route
          path="*"
          element={<Navigate replace to={CLUSTER_URL(organizationId, clusterId) + CLUSTER_SETTINGS_URL} />}
        />
      </Routes>
    </Container>
  )
}

export default PagesCluster
