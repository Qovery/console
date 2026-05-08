import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import { CLONE_MIGRATION_USE_CASES, EnvironmentsTable } from '@qovery/domains/environments/feature'
import { LoaderSpinner } from '@qovery/shared/ui'
import { useUseCasePage } from '../../../../../../app/components/use-cases/use-case-context'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/project/$projectId/overview')({
  component: RouteComponent,
})

function RouteComponent() {
  const { selectedCaseId } = useUseCasePage({
    pageId: 'environment-clone-migration',
    options: CLONE_MIGRATION_USE_CASES,
    defaultCaseId: 'default',
  })

  return (
    <Suspense
      fallback={
        <div
          data-testid="project-overview-loader"
          className="container mx-auto mt-6 flex items-center justify-center pb-10"
        >
          <LoaderSpinner className="w-6" />
        </div>
      }
    >
      <EnvironmentsTable cloneUseCaseId={selectedCaseId} />
    </Suspense>
  )
}
