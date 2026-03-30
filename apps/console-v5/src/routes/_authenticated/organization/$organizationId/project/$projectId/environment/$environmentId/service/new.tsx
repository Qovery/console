import { createFileRoute, useParams } from '@tanstack/react-router'
import { Suspense } from 'react'
import { useEnvironment, useLifecycleTemplates } from '@qovery/domains/environments/feature'
import { ServiceNew } from '@qovery/domains/services/feature'
import { Heading, Icon, Link, LoaderSpinner, Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/new'
)({
  component: RouteComponent,
})

function ServiceNewContent() {
  const { organizationId = '', projectId = '', environmentId = '' } = useParams({ strict: false })
  const { data: environment } = useEnvironment({ environmentId, suspense: true })
  const { data: availableTemplates = [] } = useLifecycleTemplates({ environmentId, suspense: true })
  const cloudProvider = environment?.cloud_provider?.provider

  useDocumentTitle('Create new service - Qovery')

  return (
    <Section className="flex w-full flex-1 flex-col pb-24 pt-8">
      <Link
        color="brand"
        to="/organization/$organizationId/project/$projectId/environment/$environmentId/overview"
        params={{ organizationId, projectId, environmentId }}
        className="mb-8 gap-1 text-sm"
      >
        <Icon iconName="arrow-left" />
        Back to services list
      </Link>
      <div className="mb-4 flex flex-col text-center">
        <Heading className="mb-2 text-2xl text-neutral">Create new service</Heading>
        <p className="text-sm text-neutral-subtle">
          Step into the Qovery service and embrace the power of collaboration to kickstart your next project.
        </p>
      </div>
      <ServiceNew
        organizationId={organizationId}
        projectId={projectId}
        environmentId={environmentId}
        clusterId={environment?.cluster_id}
        cloudProvider={cloudProvider}
        availableTemplates={availableTemplates}
      />
    </Section>
  )
}

function RouteComponent() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <LoaderSpinner />
        </div>
      }
    >
      <ServiceNewContent />
    </Suspense>
  )
}
