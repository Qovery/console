import { createFileRoute } from '@tanstack/react-router'
import { AcceptInvitationFeature } from '@qovery/shared/console-shared'

export const Route = createFileRoute('/_authenticated/accept-invitation/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AcceptInvitationFeature />
}
