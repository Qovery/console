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
    <Section className="flex w-full flex-1 flex-col pb-10 pt-6">
      <Link
        color="brand"
        to="/organization/$organizationId/project/$projectId/environment/$environmentId/overview"
        params={{ organizationId, projectId, environmentId }}
        className="mb-2 w-fit gap-1 text-xs"
      >
        <Icon iconName="arrow-left" />
        Back to services list
      </Link>
      <div className="mb-6 border-b border-neutral pb-6">
        <Heading className="text-2xl text-neutral">Create a new service</Heading>
      </div>
      <ServiceNew
        organizationId={organizationId}
        projectId={projectId}
        environmentId={environmentId}
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
