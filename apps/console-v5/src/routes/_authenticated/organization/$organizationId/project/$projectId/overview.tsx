import { Link, createFileRoute, useParams } from '@tanstack/react-router'
import { type EnvironmentModeEnum, type EnvironmentOverviewResponse } from 'qovery-typescript-axios'
import { Suspense, useMemo } from 'react'
import { match } from 'ts-pattern'
import { ClusterAvatar } from '@qovery/domains/clusters/feature'
import { CreateCloneEnvironmentModal, EnvironmentMode, useEnvironments } from '@qovery/domains/environments/feature'
import { useEnvironmentsOverview, useProject } from '@qovery/domains/projects/feature'
import {
  Button,
  Heading,
  Icon,
  LoaderSpinner,
  Section,
  StatusChip,
  TablePrimitives,
  Tooltip,
  Truncate,
  useModal,
} from '@qovery/shared/ui'
import { timeAgo } from '@qovery/shared/util-dates'
import { pluralize, twMerge } from '@qovery/shared/util-js'

const { Table } = TablePrimitives

export const Route = createFileRoute('/_authenticated/organization/$organizationId/project/$projectId/overview')({
  component: RouteComponent,
})

const gridLayoutClassName = 'grid grid-cols-[3fr_2fr_2fr_180px_100px]'

function EnvRow({ overview }: { overview: EnvironmentOverviewResponse }) {
  const { organizationId, projectId } = useParams({ strict: false })
  const { data: environments = [] } = useEnvironments({ projectId, suspense: true })
  const environment = environments.find((env) => env.id === overview.id)
  const runningStatus = environment?.runningStatus

  return (
    <Table.Row key={overview.id} className={twMerge('w-full', gridLayoutClassName)}>
      <Table.Cell className="h-12">
        <div className="flex h-full items-center justify-between">
          <Link
            to="/organization/$organizationId/project/$projectId/environment/$environmentId/"
            params={{ organizationId, projectId, environmentId: overview.id }}
            className="text-sm font-medium"
          >
            <Truncate text={overview.name} truncateLimit={54} />
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-normal text-neutral-subtle">
              {overview.service_count} {pluralize(overview.service_count, 'service')}
            </span>
            {runningStatus && (
              <Tooltip content={runningStatus?.stateLabel}>
                <StatusChip status={runningStatus.state} />
              </Tooltip>
            )}
          </div>
        </div>
      </Table.Cell>
      <Table.Cell className="h-12 border-l border-neutral">
        <div className="flex h-full items-center justify-between">
          {timeAgo(new Date(overview.deployment_status?.last_deployment_date ?? Date.now()))} ago
          <StatusChip status={overview.deployment_status?.last_deployment_state} />
        </div>
      </Table.Cell>
      <Table.Cell className="h-12 border-l border-neutral">
        {overview.cluster && (
          <div className="flex h-full items-center">
            <ClusterAvatar cluster={overview.cluster} size="sm" />
            {overview.cluster?.name}
          </div>
        )}
      </Table.Cell>
      <Table.Cell className="h-12 border-l border-neutral">
        <div className="flex h-full items-center">{timeAgo(new Date(overview.updated_at ?? Date.now()))} ago</div>
      </Table.Cell>
      <Table.Cell className="h-12 border-l border-neutral">
        <div className="flex h-full items-center"></div>
      </Table.Cell>
    </Table.Row>
  )
}

function EnvironmentSection({
  type,
  items,
  onCreateEnvClicked,
}: {
  type: EnvironmentModeEnum
  items: EnvironmentOverviewResponse[]
  onCreateEnvClicked: () => void
}) {
  const title = match(type)
    .with('PRODUCTION', () => 'Production')
    .with('STAGING', () => 'Staging')
    .with('DEVELOPMENT', () => 'Development')
    .with('PREVIEW', () => 'Ephemeral')
    .exhaustive()

  return (
    <Section className="flex flex-col gap-3.5">
      <div className="flex items-center gap-2">
        <EnvironmentMode mode={type} variant="shrink" />
        <Heading level={3}>{title}</Heading>
      </div>
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-md border border-neutral bg-surface-neutral-subtle p-8">
          <EnvironmentMode mode={type} variant="shrink" />
          <span className="text-sm text-neutral-subtle">No {title.toLowerCase()} environment created yet</span>
          <Button size="md" variant="outline" className="gap-2" onClick={onCreateEnvClicked}>
            <Icon iconName="circle-plus" iconStyle="regular" />
            Create
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-neutral bg-surface-neutral">
          <Table.Root className="divide-y divide-neutral">
            <Table.Header>
              <Table.Row className={twMerge('w-full items-center text-xs', gridLayoutClassName)}>
                <Table.ColumnHeaderCell className="flex h-9 items-center text-neutral-subtle">
                  Environment
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="flex h-9 items-center border-l border-neutral text-neutral-subtle">
                  Last operation
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="flex h-9 items-center border-l border-neutral text-neutral-subtle">
                  Cluster
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="flex h-9 items-center border-l border-neutral text-neutral-subtle">
                  Last update
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="flex h-9 items-center border-l border-neutral text-right text-neutral-subtle">
                  Actions
                </Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body className="divide-y divide-neutral">
              {items.map((environmentOverview) => (
                <EnvRow key={environmentOverview.id} overview={environmentOverview} />
              ))}
            </Table.Body>
          </Table.Root>
        </div>
      )}
    </Section>
  )
}

function ProjectOverview() {
  const { openModal, closeModal } = useModal()
  const { organizationId, projectId } = useParams({ strict: false })
  const { data: project } = useProject({ organizationId, projectId, suspense: true })
  const { data: environmentsOverview } = useEnvironmentsOverview({ projectId, suspense: true })

  const groupedEnvs = useMemo(() => {
    return environmentsOverview?.reduce((acc, env) => {
      acc.set(env.mode, [...(acc.get(env.mode) || []), env])
      return acc
    }, new Map<EnvironmentModeEnum, EnvironmentOverviewResponse[]>())
  }, [environmentsOverview])

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
            type="PRODUCTION"
            items={groupedEnvs?.get('PRODUCTION') || []}
            onCreateEnvClicked={onCreateEnvClicked}
          />
          <EnvironmentSection
            type="STAGING"
            items={groupedEnvs?.get('STAGING') || []}
            onCreateEnvClicked={onCreateEnvClicked}
          />
          <EnvironmentSection
            type="DEVELOPMENT"
            items={groupedEnvs?.get('DEVELOPMENT') || []}
            onCreateEnvClicked={onCreateEnvClicked}
          />
          <EnvironmentSection
            type="PREVIEW"
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
