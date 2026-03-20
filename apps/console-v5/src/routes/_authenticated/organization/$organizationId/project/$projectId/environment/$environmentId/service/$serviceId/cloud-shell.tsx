import { createFileRoute } from '@tanstack/react-router'
import { DatabaseModeEnum } from 'qovery-typescript-axios'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { ServiceTerminal, useService } from '@qovery/domains/services/feature'
import { Icon } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/cloud-shell',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { environmentId = '', serviceId = '' } = Route.useParams()
  useDocumentTitle('Service - Cloud shell')

  const { data: environment } = useEnvironment({
    environmentId,
    suspense: true,
  })

  const { data: service } = useService({
    environmentId,
    serviceId,
    suspense: true,
  })

  const isManagedDatabase = service?.serviceType === 'DATABASE' && service.mode === DatabaseModeEnum.MANAGED

  if (!environment || !service) {
    return null
  }

  if (isManagedDatabase) {
    return (
      <div className="flex min-h-page-container flex-1 flex-col bg-background p-6">
        <div className="flex h-full flex-col items-center justify-center gap-1 rounded border border-neutral py-10 text-sm text-neutral">
          <Icon className="text-xl text-neutral-subtle" iconName="circle-info" iconStyle="regular" />
          <span className="font-medium">Cloud shell is not available for managed databases.</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-page-container flex-1 flex-col bg-background">
      <div className="flex min-h-0 flex-1 flex-col">
        <ServiceTerminal
          organizationId={environment.organization.id}
          clusterId={environment.cluster_id}
          projectId={environment.project.id}
          environmentId={environment.id}
          serviceId={service.id}
          className="rounded-none border-0"
          backgroundClassName="bg-background"
        />
      </div>
    </div>
  )
}
