import { createFileRoute, useParams } from '@tanstack/react-router'
import { ClusterNew } from '@qovery/domains/clusters/feature'
import { Heading, Icon, Link, Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/cluster/new')({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId = '' } = useParams({ strict: false })
  useDocumentTitle('Create new cluster')

  return (
    <Section className="flex w-full flex-1 flex-col pb-48 pt-6">
      <Link
        color="brand"
        to="/organization/$organizationId/clusters"
        params={{ organizationId }}
        className="mb-2 text-xs"
      >
        <Icon iconName="arrow-left" className="mr-1" />
        Back to clusters
      </Link>
      <div className="flex flex-col border-b border-neutral pb-6">
        <Heading className="text-2xl">Install cluster</Heading>
      </div>
      <ClusterNew />
    </Section>
  )
}
