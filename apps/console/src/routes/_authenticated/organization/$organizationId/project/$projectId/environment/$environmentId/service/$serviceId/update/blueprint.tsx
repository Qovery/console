import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useCallback, useEffect } from 'react'
import { BlueprintUpdateFlow, useService } from '@qovery/domains/services/feature'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/update/blueprint'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId, projectId, environmentId, serviceId } = Route.useParams()
  const navigate = useNavigate()
  const { data: service } = useService({ environmentId, serviceId, suspense: true })
  const blueprintId = service && 'blueprint_id' in service ? service.blueprint_id : undefined
  const navigateToOverview = useCallback(() => {
    navigate({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/$serviceId/overview',
      params: { organizationId, projectId, environmentId, serviceId },
    })
  }, [environmentId, navigate, organizationId, projectId, serviceId])

  useEffect(() => {
    if (service && !blueprintId) navigateToOverview()
  }, [blueprintId, navigateToOverview, service])

  if (!service || !blueprintId) return null

  return (
    <BlueprintUpdateFlow
      blueprintId={blueprintId}
      environmentId={environmentId}
      service={service}
      onExit={navigateToOverview}
    />
  )
}
