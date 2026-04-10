import { createFileRoute } from '@tanstack/react-router'
import { HelmValuesOverrideArgumentsSettings } from '@qovery/domains/service-settings/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings/values-override-arguments'
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <HelmValuesOverrideArgumentsSettings />
}
