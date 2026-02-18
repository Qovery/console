import { createFileRoute } from '@tanstack/react-router'
import { SettingsHelmRepositories } from '@qovery/domains/organizations/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/helm-repositories')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SettingsHelmRepositories />
}
