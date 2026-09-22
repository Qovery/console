import { createFileRoute } from '@tanstack/react-router'
import { Heading, Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/cluster/$clusterId/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  useDocumentTitle('Cluster - Profile')

  return (
    <Section className="p-8">
      <Heading>Profile</Heading>
    </Section>
  )
}
