import { createFileRoute } from '@tanstack/react-router'
import { SettingsContainerRegistries } from '@qovery/domains/organizations/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/container-registries')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SettingsContainerRegistries />
}
