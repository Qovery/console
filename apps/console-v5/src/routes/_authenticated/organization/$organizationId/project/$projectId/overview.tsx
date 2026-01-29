import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import { EnvironmentsTable } from '@qovery/domains/environments/feature'
import { LoaderSpinner } from '@qovery/shared/ui'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/project/$projectId/overview')({
  component: RouteComponent,
})

function RouteComponent() {
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
      <EnvironmentsTable />
    </Suspense>
  )
}
