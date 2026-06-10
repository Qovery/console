import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Suspense, useCallback, useEffect } from 'react'
import { BlueprintCreationFlow, useBlueprintCatalog } from '@qovery/domains/services/feature'
import { LoaderSpinner } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/blueprint/$provider/$serviceFamily/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center py-8">
          <LoaderSpinner />
        </div>
      }
    >
      <BlueprintCreationFlowContent />
    </Suspense>
  )
}

function BlueprintCreationFlowContent() {
  const { organizationId, projectId, environmentId, provider, serviceFamily } = Route.useParams()
  const navigate = useNavigate()
  const { data: blueprintCatalog } = useBlueprintCatalog({ organizationId, suspense: true })
  const blueprint = blueprintCatalog?.blueprints.find(
    (blueprint) => blueprint.provider === provider && (blueprint.serviceFamily ?? blueprint.provider) === serviceFamily
  )

  useDocumentTitle(`${blueprint?.name ?? 'Blueprint'} configuration - Qovery`)

  const navigateToServiceCatalog = useCallback(() => {
    navigate({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/new',
      params: { organizationId, projectId, environmentId },
    })
  }, [environmentId, navigate, organizationId, projectId])

  useEffect(() => {
    if (!blueprint) navigateToServiceCatalog()
  }, [blueprint, navigateToServiceCatalog])

  if (!blueprint) return null

  return (
    <BlueprintCreationFlow blueprint={blueprint} organizationId={organizationId} onExit={navigateToServiceCatalog} />
  )
}
