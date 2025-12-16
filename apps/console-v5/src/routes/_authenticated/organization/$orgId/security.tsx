import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/organization/$orgId/security')({
  component: RouteComponent,
})

function RouteComponent() {
  return <p className="text-neutral">Security</p>
}
