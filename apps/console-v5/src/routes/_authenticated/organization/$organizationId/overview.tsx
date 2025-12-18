import { createFileRoute, useParams } from '@tanstack/react-router'
import { Suspense } from 'react'
import { SectionProductionHealth } from '@qovery/domains/clusters/feature'
import { OrganizationOverview } from '@qovery/domains/organizations/feature'
import { ProjectList } from '@qovery/domains/projects/feature'
import { Skeleton } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

export const Route = createFileRoute('/_authenticated/organization/$organizationId/overview')({
  component: RouteComponent,
})

const Loader = () => {
  return (
    <div className="container mx-auto pb-10">
      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Skeleton width={64} height={64} className="rounded-full" />
            <Skeleton width={160} height={24} />
          </div>
        </div>
        <div className="flex w-full flex-col gap-12 md:flex-row md:justify-between">
          <div className="flex w-full flex-col gap-8">
            <div className="flex w-full flex-col gap-3">
              <Skeleton width={100} height={24} />
              <Skeleton height={558} className="w-full" />
            </div>
            <div className="flex w-full flex-col gap-3">
              <Skeleton width={100} height={24} />
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} height={74} className="w-full" />
                ))}
              </div>
            </div>
          </div>
          <div className="flex w-full flex-col gap-8 md:max-w-96">
            <div className="flex w-full flex-col gap-3">
              <Skeleton width={100} height={24} />
              <Skeleton height={102} className="w-full" />
            </div>
            <div className="flex w-full flex-col gap-3">
              <Skeleton width={100} height={24} />
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} height={62} className="w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function RouteComponent() {
  const { organizationId } = useParams({ strict: false })
  useDocumentTitle('Organization - Overview')

  return (
    <Suspense fallback={<Loader />}>
      <OrganizationOverview organizationId={organizationId}>
        <SectionProductionHealth organizationId={organizationId} />
        <ProjectList organizationId={organizationId} />
      </OrganizationOverview>
    </Suspense>
  )
}
