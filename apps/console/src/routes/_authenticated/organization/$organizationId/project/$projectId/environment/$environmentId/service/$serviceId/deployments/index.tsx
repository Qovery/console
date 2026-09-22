import { createFileRoute, useParams } from '@tanstack/react-router'
import { Suspense } from 'react'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { isAgenticWorkflow } from '@qovery/domains/services/data-access'
import {
  AgenticWorkflowServiceActions,
  ServiceActions,
  ServiceDeploymentList,
  ServiceDeploymentListSkeleton,
  useService,
} from '@qovery/domains/services/feature'
import { Heading, Section } from '@qovery/shared/ui'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/deployments/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { environmentId = '', serviceId = '' } = useParams({ strict: false })
  const { data: environment } = useEnvironment({ environmentId, suspense: true })
  const { data: service } = useService({ environmentId, serviceId, suspense: true })

  if (!environment || !service) return null

  const isAgentTask = isAgenticWorkflow(service)

  return (
    <div className="container mx-auto flex min-h-page-container flex-col pt-6">
      <Section className="min-h-0 flex-1 gap-8">
        <div className="flex shrink-0 flex-col gap-6">
          <div className="flex justify-between">
            <Heading>{isAgentTask ? 'Executions' : 'Deployments'}</Heading>
            {isAgentTask ? (
              <AgenticWorkflowServiceActions environment={environment} service={service} variant="header" />
            ) : (
              <ServiceActions environment={environment} serviceId={serviceId} variant="deploy-dropdown-only" />
            )}
          </div>
          <hr className="w-full border-neutral" />
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-8 pb-20">
          <Suspense fallback={<ServiceDeploymentListSkeleton />}>
            <ServiceDeploymentList environment={environment} serviceId={serviceId} />
          </Suspense>
        </div>
      </Section>
    </div>
  )
}
