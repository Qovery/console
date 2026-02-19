import { createFileRoute, useParams } from '@tanstack/react-router'
import { Suspense } from 'react'
import { EnvironmentMode, useEnvironment } from '@qovery/domains/environments/feature'
import { ServiceList } from '@qovery/domains/services/feature'
import { SERVICES_NEW_URL, SERVICES_URL } from '@qovery/shared/routes'
import { Heading, Icon, Link, Section, Skeleton, TablePrimitives } from '@qovery/shared/ui'

const { Table } = TablePrimitives

export const Route = createFileRoute(
  '/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/overview'
)({
  component: RouteComponent,
})

function Services() {
  const { environmentId = '', projectId = '', organizationId = '' } = useParams({ strict: false })
  const { data: environment } = useEnvironment({ environmentId, suspense: true })

  if (!environment) {
    return null
  }

  return (
    <Section className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <Heading level={2}>Services</Heading>
        <Link
          as="button"
          variant="outline"
          className="gap-2"
          to={`${SERVICES_URL(organizationId, projectId, environmentId)}${SERVICES_NEW_URL}`}
        >
          <Icon iconName="circle-plus" iconStyle="regular" />
          New service
        </Link>
      </div>
      <ServiceList environment={environment} />
    </Section>
  )
}

function EnvironmentOverview() {
  const { environmentId } = useParams({ strict: false })
  const { data: environment } = useEnvironment({ environmentId, suspense: true })

  if (!environment) {
    return null
  }

  return (
    <div className="container mx-auto mt-6 pb-10">
      <Section className="gap-8">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between">
            <div className="flex items-center gap-3">
              <EnvironmentMode mode={environment.mode} variant="shrink" />
              <Heading>{environment?.name}</Heading>
            </div>
          </div>
          <hr className="w-full border-neutral" />
        </div>
        <div className="flex flex-col gap-8">
          <Services />
        </div>
      </Section>
    </div>
  )
}

function ServiceListSkeleton() {
  const columnSizes = ['40%', '15%', '15%', '20%', '10%']

  return (
    <div className="container mx-auto mt-6 pb-10">
      <Section className="gap-8">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between">
            <div className="flex items-center gap-3">
              <Skeleton height={32} width={32} />
              <Skeleton height={32} width={100} />
            </div>
          </div>
          <hr className="w-full border-neutral" />
        </div>
        <div className="flex flex-col gap-8">
          <Section className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <Skeleton height={28} width={90} />
              <Skeleton height={28} width={140} />
            </div>
            <Table.Root className="w-full border-b">
              <Table.Header>
                <Table.Row>
                  {[...Array(5)].map((_, index) => (
                    <Table.ColumnHeaderCell
                      key={index}
                      className="first:border-r"
                      style={{ width: columnSizes[index] }}
                    >
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
      </Section>
    </div>
  )
}

function RouteComponent() {
  return (
    <Suspense fallback={<ServiceListSkeleton />}>
      <EnvironmentOverview />
    </Suspense>
  )
}
