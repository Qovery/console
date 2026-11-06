import { createFileRoute } from '@tanstack/react-router'
import { SettingsRbacV2Page } from '@qovery/domains/organizations/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/roles/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SettingsRbacV2Page pageId="roles" />
}
