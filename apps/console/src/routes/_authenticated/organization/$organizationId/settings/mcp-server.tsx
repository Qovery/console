import { createFileRoute } from '@tanstack/react-router'
import { SettingsMcpServer } from '@qovery/domains/organizations/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/mcp-server')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SettingsMcpServer />
}
