import { createFileRoute } from '@tanstack/react-router'
import { NotificationChannelOverview } from '@qovery/domains/observability/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/infrastructure/alerts/notification-channel'
)({
  component: NotificationChannelComponent,
})

function NotificationChannelComponent() {
  return <NotificationChannelOverview />
}
