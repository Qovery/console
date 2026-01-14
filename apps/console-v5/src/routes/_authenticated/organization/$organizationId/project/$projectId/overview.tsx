import { Link, createFileRoute, useParams } from '@tanstack/react-router'
import { type Environment, type EnvironmentModeEnum } from 'qovery-typescript-axios'
import { Suspense, useMemo } from 'react'
import { match } from 'ts-pattern'
import { ClusterAvatar } from '@qovery/domains/clusters/feature'
import { useClusters } from '@qovery/domains/clusters/feature'
import { CreateCloneEnvironmentModal, useEnvironments } from '@qovery/domains/environments/feature'
import { useProject } from '@qovery/domains/projects/feature'
import { useServices } from '@qovery/domains/services/feature'
import { Button, EnvType, Heading, Icon, LoaderSpinner, Section, TablePrimitives, useModal } from '@qovery/shared/ui'
import { pluralize } from '@qovery/shared/util-js'

const { Table } = TablePrimitives

export const Route = createFileRoute('/_authenticated/organization/$organizationId/project/$projectId/overview')({
  component: RouteComponent,
})

function EnvRow({ environment }: { environment: Environment }) {
  const { organizationId, projectId } = useParams({ strict: false })
  const { data: clusters } = useClusters({ organizationId, suspense: true })
  const { data: services } = useServices({ environmentId: environment.id, suspense: true })

  return (
    <Table.Row key={environment.id}>
      <Table.Cell className="h-12">
        <div className="flex items-center justify-between">
          <Link
            to="/organization/$organizationId/project/$projectId/environment/$environmentId/"
            params={{ organizationId, projectId, environmentId: environment.id }}
            className="text-sm font-medium"
          >
            {environment.name}
          </Link>
          <span className="font-normal text-neutral-subtle">
            {services?.length} {pluralize(services?.length ?? 0, 'service')}
          </span>
        </div>
      </Table.Cell>
      <Table.Cell className="h-12 border-l border-neutral">–</Table.Cell>
      <Table.Cell className="h-12 border-l border-neutral">
        <div className="flex items-center gap-2">
          <ClusterAvatar cluster={clusters?.find((cluster) => cluster.id === environment.cluster_id)} size="sm" />
          {clusters?.find((cluster) => cluster.id === environment.cluster_id)?.name}
        </div>
      </Table.Cell>
      <Table.Cell className="h-12 border-l border-neutral">–</Table.Cell>
      <Table.Cell className="h-12 border-l border-neutral">–</Table.Cell>
    </Table.Row>
  )
}

function EnvironmentSection({
  type,
  items,
  onCreateEnvClicked,
}: {
  type: 'production' | 'staging' | 'development' | 'ephemeral'
  items: Environment[]
  onCreateEnvClicked: () => void
}) {
  const title = match(type)
    .with('production', () => 'Production')
    .with('staging', () => 'Staging')
    .with('development', () => 'Development')
    .with('ephemeral', () => 'Ephemeral')
    .exhaustive()

  return (
    <Section className="flex flex-col gap-3.5">
      <div className="flex items-center gap-2">
        <EnvType type={type} size="lg" />
        <Heading level={3}>{title}</Heading>
      </div>
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-md border border-neutral bg-surface-neutral-subtle p-8">
          <EnvType type={type} size="lg" />
          <span className="text-sm text-neutral-subtle">No {title.toLowerCase()} environment created yet</span>
          <Button size="md" variant="outline" className="gap-2" onClick={onCreateEnvClicked}>
            <Icon iconName="circle-plus" iconStyle="regular" />
            Create
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-neutral bg-surface-neutral-subtle">
          <Suspense
            fallback={
              <div className="flex w-full items-center justify-center py-8">
                <LoaderSpinner className="w-6" />
              </div>
            }
          >
            <Table.Root className="divide-y divide-neutral">
              <Table.Header>
                <Table.Row className="text-xs">
                  <Table.ColumnHeaderCell className="h-9 text-neutral-subtle">Environment</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="h-9 border-l border-neutral text-neutral-subtle">
                    Last operation
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="h-9 border-l border-neutral text-neutral-subtle">
                    Cluster
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="h-9 border-l border-neutral text-neutral-subtle">
                    Last update
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="h-9 border-l border-neutral text-right text-neutral-subtle">
                    Actions
                  </Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body className="divide-y divide-neutral">
                {items.map((environment) => (
                  <EnvRow key={environment.id} environment={environment} />
                ))}
              </Table.Body>
            </Table.Root>
          </Suspense>
        </div>
      )}
    </Section>
  )
}

function ProjectOverview() {
  const { openModal, closeModal } = useModal()
  const { organizationId, projectId } = useParams({ strict: false })
  const { data: project } = useProject({ organizationId, projectId, suspense: true })
  const { data: environments } = useEnvironments({ projectId, suspense: true })

  const groupedEnvs = useMemo(() => {
    return environments?.reduce((acc, env) => {
      acc.set(env.mode, [...(acc.get(env.mode) || []), env])
      return acc
    }, new Map<EnvironmentModeEnum, Environment[]>())
  }, [environments])

  const onCreateEnvClicked = () => {
    openModal({
      content: (
        <CreateCloneEnvironmentModal onClose={closeModal} projectId={projectId} organizationId={organizationId} />
      ),
      options: {
        fakeModal: true,
      },
    })
  }

  return (
    <div className="container mx-auto mt-6 pb-10">
      <Section className="gap-8">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between">
            <Heading>{project?.name}</Heading>
            <Button
              onClick={() => {
                onCreateEnvClicked()
              }}
              variant="solid"
              className="gap-1.5"
              size="md"
            >
              <Icon iconName="circle-plus" iconStyle="regular" />
              New Environment
            </Button>
          </div>
          <hr className="w-full border-neutral" />
        </div>
        <div className="flex flex-col gap-8">
          <EnvironmentSection
            type="production"
            items={groupedEnvs?.get('PRODUCTION') || []}
            onCreateEnvClicked={onCreateEnvClicked}
          />
          <EnvironmentSection
            type="staging"
            items={groupedEnvs?.get('STAGING') || []}
            onCreateEnvClicked={onCreateEnvClicked}
          />
          <EnvironmentSection
            type="development"
            items={groupedEnvs?.get('DEVELOPMENT') || []}
            onCreateEnvClicked={onCreateEnvClicked}
          />
          <EnvironmentSection
            type="ephemeral"
            items={groupedEnvs?.get('PREVIEW') || []}
            onCreateEnvClicked={onCreateEnvClicked}
          />
        </div>
      </Section>
    </div>
  )
}

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
      <ProjectOverview />
    </Suspense>
  )
}
