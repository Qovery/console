import { Navigate, createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import {
  PLATFORM_CONFIGURATION_FEATURE_FLAG,
  StepPlatform,
  useClusterContainerCreateContext,
} from '@qovery/domains/clusters/feature'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/cluster/create/$slug/platform')({
  component: Platform,
})

function Platform() {
  useDocumentTitle('Platform layers - Create Cluster')
  const { organizationId = '', slug = '' } = useParams({ strict: false })
  const navigate = useNavigate()
  const { isEngineV2SelfManaged } = useClusterContainerCreateContext()
  const isPlatformConfigurationEnabled = useFeatureFlagEnabled(PLATFORM_CONFIGURATION_FEATURE_FLAG)
  const creationFlowUrl = `/organization/${organizationId}/cluster/create/${slug}`

  // Wait for the flag to resolve: it is undefined on first render, and redirecting
  // then would bounce flag-enabled users off the step on every refresh/deep-link.
  if (isPlatformConfigurationEnabled === undefined) return null

  if (!isEngineV2SelfManaged) {
    return (
      <Navigate
        to="/organization/$organizationId/cluster/create/$slug/general"
        params={{ organizationId, slug }}
        replace
      />
    )
  }

  return (
    <StepPlatform
      organizationId={organizationId}
      onPrevious={() => navigate({ to: `${creationFlowUrl}/general` })}
      onSubmit={() => navigate({ to: `${creationFlowUrl}/summary` })}
    />
  )
}
