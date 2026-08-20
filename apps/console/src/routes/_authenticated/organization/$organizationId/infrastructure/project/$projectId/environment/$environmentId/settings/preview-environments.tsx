import { createFileRoute } from '@tanstack/react-router'
import { PageSettingsPreviewEnvironmentsFeature } from '@qovery/domains/environments/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/infrastructure/project/$projectId/environment/$environmentId/settings/preview-environments'
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <PageSettingsPreviewEnvironmentsFeature />
}
