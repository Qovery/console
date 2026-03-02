import { createFileRoute } from '@tanstack/react-router'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { useDeleteService, useService } from '@qovery/domains/services/feature'
import { BlockContentDelete } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/settings/danger-zone'
)({
  component: RouteComponent,
})

function RouteComponent() {
  useDocumentTitle('Danger zone - Service settings')
  const { organizationId, projectId, environmentId, serviceId } = Route.useParams()
  const navigate = Route.useNavigate()
  const { data: environment } = useEnvironment({ environmentId })
  const { data: service } = useService({ environmentId, serviceId })
  const { mutateAsync: deleteService } = useDeleteService({ organizationId, environmentId })

  const mutationDeleteService = async () => {
    if (!service) return

    try {
      await deleteService({ serviceId, serviceType: service.serviceType })
      navigate({
        to: '/organization/$organizationId/project/$projectId/environment/$environmentId/overview',
        params: {
          organizationId,
          projectId,
          environmentId,
        },
      })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="flex w-full flex-col justify-between">
      <div className="max-w-content-with-navigation-left p-8">
        <BlockContentDelete
          title="Delete service"
          ctaLabel="Delete service"
          callback={mutationDeleteService}
          modalConfirmation={{
            mode: environment?.mode,
            title: 'Delete service',
            name: service?.name,
          }}
        />
      </div>
    </div>
  )
}
