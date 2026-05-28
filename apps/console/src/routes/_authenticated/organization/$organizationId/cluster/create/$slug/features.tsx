import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { StepFeatures, useClusterContainerCreateContext } from '@qovery/domains/clusters/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/cluster/create/$slug/features')({
  component: Features,
})

function Features() {
  useDocumentTitle('Features - Create Cluster')
  const { organizationId = '', slug } = useParams({ strict: false })
  const navigate = useNavigate()
  const { generalData } = useClusterContainerCreateContext()
  const secretManagerEnabled = useFeatureFlagEnabled('secret-manager') === true

  const creationFlowUrl = `/organization/${organizationId}/cluster/create/${slug}`

  const handleSubmit = () => {
    // Redirect to the add-ons step only when the selected cloud provider has available options: KEDA for AWS, Secret Manager for GCP.
    if (generalData?.cloud_provider === 'AWS') {
      navigate({ to: `${creationFlowUrl}/addons` })
      return
    }

    if (generalData?.cloud_provider === 'GCP') {
      navigate({ to: `${creationFlowUrl}/${secretManagerEnabled ? 'addons' : 'summary'}` })
      return
    }

    navigate({ to: `${creationFlowUrl}/summary` })
  }

  return <StepFeatures organizationId={organizationId} onSubmit={handleSubmit} />
}
