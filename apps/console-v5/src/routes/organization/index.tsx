import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/organization/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/organization/"!</div>
}
