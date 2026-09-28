import * as Dialog from '@radix-ui/react-dialog'
import { type AgenticWorkflowRun, AgenticWorkflowRunTrigger } from 'qovery-typescript-axios'
import { type KeyboardEvent, useState } from 'react'
import {
  Button,
  CopyToClipboardButtonIcon,
  EmptyState,
  Heading,
  Sheet,
  Skeleton,
  TablePrimitives,
} from '@qovery/shared/ui'
import { dateFullFormat } from '@qovery/shared/util-dates'
import { useAgenticWorkflowRunHistory } from '../hooks/use-agentic-workflow-run-history/use-agentic-workflow-run-history'

const { Table } = TablePrimitives

function triggerLabel(trigger: AgenticWorkflowRun['trigger']) {
  return {
    [AgenticWorkflowRunTrigger.MANUAL]: 'Manual',
    [AgenticWorkflowRunTrigger.SCHEDULE]: 'Schedule',
    [AgenticWorkflowRunTrigger.WEBHOOK]: 'Webhook',
  }[trigger]
}

function runDate(value: string | null) {
  return value ? dateFullFormat(value, 'UTC', 'dd MMM, HH:mm') : '—'
}

function RunDetails({ run, onClose }: { run: AgenticWorkflowRun; onClose: () => void }) {
  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-overlay bg-background-overlay" />
        <Dialog.Content asChild aria-describedby={undefined}>
          <Sheet className="fixed bottom-0 right-0 top-0 z-modal w-full max-w-2xl" aria-label="Run details">
            <div className="flex items-center justify-between border-b border-neutral p-6">
              <Dialog.Title asChild>
                <Heading level={2}>Run {run.id.slice(0, 8)}</Heading>
              </Dialog.Title>
              <Button color="neutral" variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
            <div className="flex flex-col gap-6 overflow-y-auto p-6 text-sm">
              <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3">
                <dt className="text-neutral-subtle">Run ID</dt>
                <dd className="flex min-w-0 items-center gap-2">
                  <span className="break-all font-mono text-xs">{run.id}</span>
                  <CopyToClipboardButtonIcon content={run.id} tooltipContent="Copy run ID" />
                </dd>
                <dt className="text-neutral-subtle">Trigger</dt>
                <dd>{triggerLabel(run.trigger)}</dd>
                <dt className="text-neutral-subtle">Requested (UTC)</dt>
                <dd>{runDate(run.created_at)}</dd>
                <dt className="text-neutral-subtle">Recorded in history (UTC)</dt>
                <dd>{runDate(run.recorded_at)}</dd>
                <dt className="text-neutral-subtle">Agent Task ID</dt>
                <dd className="break-all font-mono text-xs">{run.source_workflow_id}</dd>
              </dl>
              <section className="flex flex-col gap-2">
                <Heading level={3}>Prompt</Heading>
                <p className="whitespace-pre-wrap rounded border border-neutral p-4">
                  {run.prompt ?? 'No prompt recorded.'}
                </p>
              </section>
            </div>
          </Sheet>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export function AgenticWorkflowRuns({ serviceId, compact = false }: { serviceId: string; compact?: boolean }) {
  const [selectedRun, setSelectedRun] = useState<AgenticWorkflowRun | null>(null)
  const { data, isLoading, isError, refetch } = useAgenticWorkflowRunHistory({ serviceId })
  const runs = compact ? data?.slice(0, 5) ?? [] : data ?? []

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

  if (runs.length === 0) {
    return (
      <EmptyState
        size="sm"
        icon="play"
        title="No runs yet"
        description="Trigger this agent task to see its runs here."
      />
    )
  }

  const openRunWithKeyboard = (event: KeyboardEvent<HTMLTableRowElement>, run: AgenticWorkflowRun) => {
    if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      setSelectedRun(run)
    }
  }

  return (
    <div className="flex grow flex-col justify-between">
      <div className="overflow-x-auto">
        <Table.Root className="w-full min-w-[1080px] table-fixed overflow-x-scroll text-ssm">
          <Table.Header>
            <Table.Row className="divide-x divide-neutral">
              {['Date', 'Trigger', 'Recorded', 'Prompt'].map((title) => (
                <Table.ColumnHeaderCell
                  key={title}
                  className={title === 'Date' ? 'w-[40%] font-medium' : 'font-medium'}
                >
                  {title}
                </Table.ColumnHeaderCell>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {runs.map((run) => (
              <Table.Row
                key={run.id}
                className="h-[68px] cursor-pointer divide-x divide-neutral border-neutral hover:bg-surface-neutral-subtle focus:bg-surface-neutral-subtle"
                tabIndex={0}
                onClick={() => setSelectedRun(run)}
                onKeyDown={(event) => openRunWithKeyboard(event, run)}
              >
                <Table.Cell className="w-[40%]">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{runDate(run.created_at)}</span>
                    <span className="truncate text-neutral-subtle" title={run.id}>
                      {run.id}
                    </span>
                  </div>
                </Table.Cell>
                <Table.Cell>{triggerLabel(run.trigger)}</Table.Cell>
                <Table.Cell>{runDate(run.recorded_at)}</Table.Cell>
                <Table.Cell>
                  {run.prompt ? (
                    <Button
                      color="neutral"
                      variant="plain"
                      size="md"
                      onClick={(event) => {
                        event.stopPropagation()
                        setSelectedRun(run)
                      }}
                    >
                      See the full prompt
                    </Button>
                  ) : (
                    '—'
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </div>
      {selectedRun && <RunDetails run={selectedRun} onClose={() => setSelectedRun(null)} />}
    </div>
  )
}
