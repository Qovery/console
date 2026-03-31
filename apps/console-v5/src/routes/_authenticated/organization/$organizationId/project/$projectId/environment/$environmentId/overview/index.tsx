import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { ServiceList } from '@qovery/domains/services/feature'
import { Section, Skeleton, TablePrimitives } from '@qovery/shared/ui'

const { Table } = TablePrimitives

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/overview/'
)({
  component: RouteComponent,
})

function Services() {
  const { environmentId = '' } = Route.useParams()
  const { data: environment } = useEnvironment({ environmentId, suspense: true })

  if (!environment) {
    return null
  }

  return <ServiceList environment={environment} />
}

function ServiceListSkeleton() {
  const columnSizes = ['40%', '15%', '15%', '20%', '10%']

  return (
    <div>
      <div className="flex gap-2 px-4 py-2">
        <Skeleton height={24} width={80} />
        <Skeleton height={24} width={90} />
      </div>
      <hr className="w-full border-neutral" />
      <div className="flex flex-col gap-8">
        <Section className="flex flex-col gap-3.5">
          <Table.Root className="w-full" containerClassName="rounded-lg border-none">
            <Table.Header>
              <Table.Row>
                {[...Array(5)].map((_, index) => (
                  <Table.ColumnHeaderCell key={index} className="first:border-r" style={{ width: columnSizes[index] }}>
                    <Skeleton height={16} width={100} />
                  </Table.ColumnHeaderCell>
                ))}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {[...Array(3)].map((_, index) => (
                <Table.Row key={index}>
                  {[...Array(5)].map((_, index) => (
                    <Table.Cell key={index} className="h-14 first:border-r" style={{ width: columnSizes[index] }}>
                      {index === 0 ? (
                        <div className="flex items-center justify-between">
                          <Skeleton height={16} width={300} />
                          <Skeleton height={16} width={200} />
                        </div>
                      ) : (
                        <Skeleton height={16} width={60} />
                      )}
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Section>
      </div>
    </div>
  )
}

function RouteComponent() {
  return (
    <Suspense fallback={<ServiceListSkeleton />}>
      <Services />
    </Suspense>
  )
}
