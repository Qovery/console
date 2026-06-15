import { createFileRoute } from '@tanstack/react-router'
import { SettingsArgoCdIntegration } from '@qovery/domains/organizations/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/argocd-integration')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SettingsArgoCdIntegration />
}
