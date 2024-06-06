import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/organizations/$organizationId/clusters/$clusterId/_logs/')({
  component: () => <div>Hello /organizations/$organizationId/clusters/$clusterId/_logs/!</div>,
})
