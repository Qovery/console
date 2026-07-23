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
  const { data: availableTemplates = [] } = useLifecycleTemplates({ environmentId })
  const cloudProvider = environment?.cloud_provider?.provider

  useDocumentTitle('Create new service - Qovery')

  return (
    <Section className="flex w-full flex-1 flex-col pb-24 pt-8">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-8">
        <div className="flex flex-col gap-2 border-b border-neutral pb-6">
          <Link
            color="brand"
            size="xs"
            to="/organization/$organizationId/project/$projectId/environment/$environmentId/overview"
            params={{ organizationId, projectId, environmentId }}
            className="gap-1"
          >
            <Icon iconName="arrow-left" className="text-2xs" />
            Back to services list
          </Link>
          <Heading className="text-2xl leading-8 text-neutral">Create new service</Heading>
        </div>
        <ServiceNew
          organizationId={organizationId}
          projectId={projectId}
          environmentId={environmentId}
          cloudProvider={cloudProvider}
          availableTemplates={availableTemplates}
        />
      </div>
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
