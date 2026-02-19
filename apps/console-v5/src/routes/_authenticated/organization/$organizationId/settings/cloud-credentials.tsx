import { createFileRoute } from '@tanstack/react-router'
import { SettingsCloudCredentials } from '@qovery/domains/organizations/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/cloud-credentials')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SettingsCloudCredentials />
}
