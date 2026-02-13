import { createFileRoute, useParams } from '@tanstack/react-router'
import { ClusterNew } from '@qovery/domains/clusters/feature'
import { Heading, Icon, Link, Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/cluster/new')({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId } = useParams({ strict: false })
  useDocumentTitle('Create new cluster')

  return (
    <Section className="flex w-full flex-1 flex-col gap-8 pb-48 pt-8">
      <Link color="brand" to="/organization/$organizationId/clusters" params={{ organizationId }} className="text-sm">
        <Icon iconName="arrow-left" className="mr-1" />
        Back to clusters
      </Link>
      <div className="flex flex-col">
        <Heading className="mb-2 text-2xl">Install cluster</Heading>
        <hr className="my-4 border-neutral" />
      </div>
      <ClusterNew />
    </Section>
  )
}
