import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/organization/$orgId/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  return <p className="text-neutral">Settings</p>
}
