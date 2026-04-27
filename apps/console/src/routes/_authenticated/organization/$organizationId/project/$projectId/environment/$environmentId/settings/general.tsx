import { createFileRoute } from '@tanstack/react-router'
import { PageEnvironmentGeneralSettingsForm } from '@qovery/domains/environments/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/settings/general'
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <PageEnvironmentGeneralSettingsForm />
}
