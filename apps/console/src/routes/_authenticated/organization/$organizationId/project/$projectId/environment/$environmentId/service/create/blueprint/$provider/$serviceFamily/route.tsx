import { Outlet, createFileRoute, useLocation, useNavigate } from '@tanstack/react-router'
import { useCallback, useEffect } from 'react'
import {
  BlueprintCreationFlow,
  BlueprintQueryBoundary,
  blueprintCreationSteps,
  useBlueprintCatalog,
} from '@qovery/domains/services/feature'
import { Button, FunnelFlow, FunnelFlowBody, Icon, Skeleton } from '@qovery/shared/ui'

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/service/create/blueprint/$provider/$serviceFamily'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { organizationId, projectId, environmentId, provider, serviceFamily } = Route.useParams()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const currentStep = pathname.endsWith('/summary') ? 2 : 1
  const navigateToServiceCatalog = useCallback(() => {
    navigate({
      to: '/organization/$organizationId/project/$projectId/environment/$environmentId/service/new',
      params: { organizationId, projectId, environmentId },
    })
  }, [environmentId, navigate, organizationId, projectId])

  return (
    <BlueprintQueryBoundary
      fallback={<BlueprintCreationFlowBoundaryFallback currentStep={currentStep} onExit={navigateToServiceCatalog} />}
      errorFallback={({ resetErrorBoundary }) => (
        <BlueprintCreationFlowBoundaryFallback
          currentStep={currentStep}
          onExit={navigateToServiceCatalog}
          onRetry={resetErrorBoundary}
        />
      )}
      resetKeys={[organizationId, projectId, environmentId, provider, serviceFamily]}
      title="blueprint configuration"
    >
      <BlueprintCreationFlowContent onExit={navigateToServiceCatalog} />
    </BlueprintQueryBoundary>
  )
}

function BlueprintCreationFlowBoundaryFallback({
  currentStep,
  onExit,
  onRetry,
}: {
  currentStep: number
  onExit: () => void
  onRetry?: () => void
}) {
  return (
    <FunnelFlow
      totalSteps={blueprintCreationSteps.length}
      currentStep={currentStep}
      currentTitle={blueprintCreationSteps[currentStep - 1]?.title}
      onExit={onExit}
    >
      {onRetry ? (
        <FunnelFlowBody customContentWidth="max-w-[620px]">
          <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-sm text-neutral-subtle">
            <div className="flex flex-col items-center gap-3">
              <span>Unable to load blueprint configuration.</span>
              <Button type="button" variant="plain" color="neutral" size="md" onClick={onRetry}>
                <Icon iconName="rotate-right" className="text-xs" />
                Retry
              </Button>
            </div>
          </div>
        </FunnelFlowBody>
      ) : (
        <BlueprintCreationFlowLoadingSkeleton />
      )}
    </FunnelFlow>
  )
}

function BlueprintCreationFlowLoadingSkeleton() {
  return (
    <div className="flex w-full items-start overflow-auto bg-background" aria-label="Loading blueprint configuration">
      <main className="mx-auto flex w-full max-w-[620px] flex-col justify-between px-4 pt-6">
        <div>
          <header className="mb-5">
            <Skeleton width="74%" height={32} />
            <Skeleton width="44%" height={20} className="mt-1" />
          </header>
          <div className="flex flex-col gap-3 pb-24">
            <section className="rounded-xl border border-neutral bg-surface-neutral">
              <div className="flex items-center gap-3 px-4 py-4">
                <Skeleton width={16} height={16} rounded />
                <Skeleton width={172} height={24} />
              </div>
              <div className="flex flex-col gap-3 px-4 pb-4">
                <Skeleton width="100%" height={52} className="rounded-md" />
                <Skeleton width="100%" height={52} className="rounded-md" />
                <Skeleton width={108} height={32} className="rounded-md" />
              </div>
            </section>
            <section className="rounded-xl border border-neutral bg-surface-neutral">
              <div className="flex items-center gap-3 px-4 py-4">
                <Skeleton width={16} height={16} rounded />
                <Skeleton width={152} height={24} />
              </div>
            </section>
            <section className="rounded-xl border border-neutral bg-surface-neutral">
              <div className="flex items-center gap-3 px-4 py-4">
                <Skeleton width={16} height={16} rounded />
                <Skeleton width={96} height={24} />
                <Skeleton width={4} height={4} rounded />
                <Skeleton width={128} height={20} />
              </div>
            </section>
          </div>
        </div>
        <footer className="fixed bottom-0 left-1/2 z-10 w-full max-w-[620px] -translate-x-1/2 border-t border-neutral bg-background px-4 py-4">
          <Skeleton width="100%" height={40} className="rounded-md" />
        </footer>
      </main>
    </div>
  )
}

function BlueprintCreationFlowContent({ onExit }: { onExit: () => void }) {
  const { organizationId, projectId, environmentId, provider, serviceFamily } = Route.useParams()
  const { data: blueprintCatalog } = useBlueprintCatalog({ organizationId, suspense: true })
  const blueprint = blueprintCatalog?.blueprints.find(
    (blueprint) => blueprint.provider === provider && (blueprint.serviceFamily ?? blueprint.provider) === serviceFamily
  )
  const creationFlowUrl = `/organization/${organizationId}/project/${projectId}/environment/${environmentId}/service/create/blueprint/${encodeURIComponent(provider)}/${encodeURIComponent(serviceFamily)}`

  useEffect(() => {
    if (!blueprint) onExit()
  }, [blueprint, onExit])

  if (!blueprint) return null

  return (
    <BlueprintCreationFlow
      blueprint={blueprint}
      organizationId={organizationId}
      creationFlowUrl={creationFlowUrl}
      onExit={onExit}
    >
      <Outlet />
    </BlueprintCreationFlow>
  )
}
