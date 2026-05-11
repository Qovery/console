import { Navigate, createFileRoute, useParams } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { SettingsArgoCdIntegration } from '@qovery/domains/organizations/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/argocd-integration')({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId = '' } = useParams({ strict: false })
  const isArgoCdEnabled = useFeatureFlagEnabled('argocd')

  if (!organizationId || typeof isArgoCdEnabled === 'undefined') {
    return null
  }

  if (isArgoCdEnabled === false) {
    return <Navigate to="/organization/$organizationId/settings/general" params={{ organizationId }} replace />
  }

  return <SettingsArgoCdIntegration />
}
