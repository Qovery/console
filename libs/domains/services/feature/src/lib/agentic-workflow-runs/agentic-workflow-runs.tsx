import { type AgenticWorkflowRun, AgenticWorkflowRunTrigger } from 'qovery-typescript-axios'
import { useState } from 'react'
import { Button, CopyToClipboardButtonIcon, EmptyState, Icon, Skeleton, TablePrimitives } from '@qovery/shared/ui'
import { dateFullFormat } from '@qovery/shared/util-dates'
import { useAgenticWorkflowRunHistory } from '../hooks/use-agentic-workflow-run-history/use-agentic-workflow-run-history'

const { Table } = TablePrimitives
const PAGE_SIZE = 20

function RunTrigger({ trigger }: { trigger: AgenticWorkflowRun['trigger'] }) {
  const label = {
    [AgenticWorkflowRunTrigger.MANUAL]: 'Manual',
    [AgenticWorkflowRunTrigger.SCHEDULE]: 'Schedule',
    [AgenticWorkflowRunTrigger.WEBHOOK]: 'Webhook',
  }[trigger]

  return <span>{label}</span>
}

export function AgenticWorkflowRuns({ serviceId, compact = false }: { serviceId: string; compact?: boolean }) {
  const [page, setPage] = useState(1)
  const pageSize = compact ? 5 : PAGE_SIZE
  const { data, isLoading, isError, isFetching, refetch } = useAgenticWorkflowRunHistory({ serviceId, page, pageSize })
  const runs = data?.results ?? []

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2" aria-label="Loading runs">
        <Skeleton height={52} />
        <Skeleton height={52} />
        <Skeleton height={52} />
      </div>
    )
  }

  if (isError) {
    return (
      <EmptyState
        size="sm"
        icon="triangle-exclamation"
        title="Runs could not be loaded"
        description="Try again in a moment."
      >
        <Button color="neutral" variant="outline" size="md" onClick={() => refetch()}>
          Retry
        </Button>
      </EmptyState>
    )
  }

  if (runs.length === 0 && page === 1) {
    return (
      <EmptyState
        size="sm"
        icon="play"
        title="No runs yet"
        description="Trigger this agent task to see its runs here."
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {runs.length === 0 ? (
        <p className="py-8 text-center text-sm text-neutral-subtle">No runs on this page.</p>
      ) : (
        <Table.Root className="min-w-[680px] table-fixed">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell className="w-40">Requested</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="w-28">Trigger</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Prompt</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="w-44">Run ID</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {runs.map((run) => (
              <Table.Row key={run.id}>
                <Table.Cell className="whitespace-nowrap">
                  {dateFullFormat(run.created_at, undefined, 'dd MMM, HH:mm')}
                </Table.Cell>
                <Table.Cell>
                  <RunTrigger trigger={run.trigger} />
                </Table.Cell>
                <Table.Cell className="max-w-0 truncate" title={run.prompt ?? undefined}>
                  {run.prompt || '—'}
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center gap-1 font-code text-xs">
                    <span className="truncate" title={run.id}>
                      {run.id}
                    </span>
                    <CopyToClipboardButtonIcon content={run.id} tooltipContent="Copy run ID" className="shrink-0" />
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}
      {!compact && (
        <div className="flex items-center justify-end gap-3">
          <Button
            color="neutral"
            variant="outline"
            size="md"
            disabled={page === 1 || isFetching}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-neutral-subtle">Page {page}</span>
          <Button
            color="neutral"
            variant="outline"
            size="md"
            disabled={runs.length < PAGE_SIZE || isFetching}
            onClick={() => setPage(page + 1)}
          >
            Next <Icon iconName="angle-right" />
          </Button>
        </div>
      )}
    </div>
  )
}
