import * as Dialog from '@radix-ui/react-dialog'
import { type AgenticWorkflowRun, AgenticWorkflowRunTrigger } from 'qovery-typescript-axios'
import { type KeyboardEvent, useState } from 'react'
import { Button, CopyToClipboardButtonIcon, EmptyState, Heading, Icon, Sheet, Skeleton } from '@qovery/shared/ui'
import { dateFullFormat } from '@qovery/shared/util-dates'
import { useAgenticWorkflowRunHistory } from '../hooks/use-agentic-workflow-run-history/use-agentic-workflow-run-history'

const PAGE_SIZE = 20

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
  const [page, setPage] = useState(1)
  const [selectedRun, setSelectedRun] = useState<AgenticWorkflowRun | null>(null)
  const pageSize = compact ? 5 : PAGE_SIZE
  const { data, isLoading, isError, isFetching, isPreviousData, refetch } = useAgenticWorkflowRunHistory({
    serviceId,
    page,
    pageSize,
  })
  const runs = data?.results ?? []
  const checkNextPage = !compact && !isLoading && !isError && !isPreviousData && runs.length === pageSize
  const {
    data: nextPageData,
    isLoading: isCheckingNextPage,
    isError: isNextPageError,
    isPreviousData: isNextPagePreviousData,
    refetch: refetchNextPage,
  } = useAgenticWorkflowRunHistory({
    serviceId,
    page: page + 1,
    pageSize,
    enabled: checkNextPage,
    refetchInterval: false,
  })
  const hasNextPage =
    checkNextPage &&
    !isCheckingNextPage &&
    !isNextPageError &&
    !isNextPagePreviousData &&
    Boolean(nextPageData?.results?.length)

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

  const openRunWithKeyboard = (event: KeyboardEvent<HTMLTableRowElement>, run: AgenticWorkflowRun) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setSelectedRun(run)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-lg border border-neutral">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral bg-surface-neutral-subtle font-mono text-xs text-neutral-subtle">
            <tr>
              {['Run ID', 'Trigger', 'Requested', 'Recorded', 'Prompt'].map((title) => (
                <th key={title} className="whitespace-nowrap px-4 py-3 font-normal">
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr
                key={run.id}
                className="cursor-pointer border-b border-neutral last:border-0 hover:bg-surface-neutral-subtle"
                tabIndex={0}
                onClick={() => setSelectedRun(run)}
                onKeyDown={(event) => openRunWithKeyboard(event, run)}
              >
                <td className="px-4 py-4">
                  <span className="font-mono text-xs hover:underline">{run.id.slice(0, 8)}</span>
                </td>
                <td className="whitespace-nowrap px-4 py-4">{triggerLabel(run.trigger)}</td>
                <td className="whitespace-nowrap px-4 py-4">{runDate(run.created_at)}</td>
                <td className="whitespace-nowrap px-4 py-4">{runDate(run.recorded_at)}</td>
                <td className="max-w-80 truncate px-4 py-4" title={run.prompt ?? undefined}>
                  {run.prompt || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {runs.length === 0 && <div className="p-8 text-center text-sm text-neutral-subtle">No runs on this page.</div>}
      </div>
      {!compact && (
        <div className="flex items-center justify-end gap-3">
          {isNextPageError && (
            <Button color="neutral" variant="outline" size="md" onClick={() => refetchNextPage()}>
              Retry next page
            </Button>
          )}
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
            disabled={!hasNextPage || isFetching}
            onClick={() => setPage(page + 1)}
          >
            Next <Icon iconName="angle-right" />
          </Button>
        </div>
      )}
      {selectedRun && <RunDetails run={selectedRun} onClose={() => setSelectedRun(null)} />}
    </div>
  )
}
