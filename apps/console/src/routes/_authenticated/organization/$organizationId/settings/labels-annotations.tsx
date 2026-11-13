import { createFileRoute } from '@tanstack/react-router'
import { SettingsLabelsAnnotations, useRbacPrototype } from '@qovery/domains/organizations/feature'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/settings/labels-annotations')({
  component: RouteComponent,
})

function RouteComponent() {
  // RBAC v2 prototype: from Next, labels merge with tags on their own page and this page keeps the annotations
  const { hasTags } = useRbacPrototype()
  return <SettingsLabelsAnnotations annotationsOnly={hasTags} />
}
