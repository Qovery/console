import { createFileRoute, notFound, redirect } from '@tanstack/react-router'

const LEGACY_INFRASTRUCTURE_ROOTS = new Set([
  'alerts',
  'audit-logs',
  'cluster',
  'clusters',
  'overview',
  'project',
  'settings',
])

export const Route = createFileRoute('/_authenticated/organization/$organizationId/$')({
  beforeLoad: ({ params }) => {
    const legacyPath = params._splat ?? ''
    const rootSegment = legacyPath.split('/')[0]
    const isLegacyClusterIdRoute = !legacyPath.includes('/')

    if (!rootSegment || (!LEGACY_INFRASTRUCTURE_ROOTS.has(rootSegment) && !isLegacyClusterIdRoute)) {
      throw notFound()
    }

    throw redirect({
      href: `/organization/${params.organizationId}/infrastructure/${legacyPath}`,
      replace: true,
    })
  },
})
