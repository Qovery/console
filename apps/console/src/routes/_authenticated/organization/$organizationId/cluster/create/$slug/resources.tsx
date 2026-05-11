import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { match } from 'ts-pattern'
import { SCW_CONTROL_PLANE_FEATURE_ID } from '@qovery/domains/cloud-providers/feature'
import { StepResources, useClusterContainerCreateContext } from '@qovery/domains/clusters/feature'
import { type ClusterResourcesData } from '@qovery/shared/interfaces'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/cluster/create/$slug/resources')({
  component: Resources,
})

function Resources() {
  useDocumentTitle('Resources - Create Cluster')
  const { organizationId = '', slug } = useParams({ strict: false })
  const navigate = useNavigate()
  const { generalData, setFeaturesData } = useClusterContainerCreateContext()

  const creationFlowUrl = `/organization/${organizationId}/cluster/create/${slug}`

  const handleSubmit = (data: ClusterResourcesData) => {
    match(generalData?.cloud_provider)
      .with('AWS', () => {
        navigate({ to: `${creationFlowUrl}/features` })
      })
      .with('SCW', () => {
        // Set control plane feature data
        setFeaturesData({
          vpc_mode: 'DEFAULT',
          features: {
            [SCW_CONTROL_PLANE_FEATURE_ID]: {
              id: SCW_CONTROL_PLANE_FEATURE_ID,
              title: 'Control Plane',
              value: true,
              extendedValue: data.scw_control_plane,
            },
          },
        })
        // Navigate to features step for network configuration
        navigate({ to: `${creationFlowUrl}/features` })
      })
      .otherwise(() => {
        navigate({ to: `${creationFlowUrl}/summary` })
        setFeaturesData(undefined)
      })
  }

  return <StepResources organizationId={organizationId} onSubmit={handleSubmit} />
}
