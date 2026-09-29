import { type IconName } from '@fortawesome/fontawesome-common-types'
import * as Dialog from '@radix-ui/react-dialog'
import { type AgenticWorkflowRun, AgenticWorkflowRunTrigger } from 'qovery-typescript-axios'
import { type KeyboardEvent, useRef, useState } from 'react'
import {
  Button,
  CopyToClipboardButtonIcon,
  EmptyState,
  Heading,
  Icon,
  Sheet,
  Skeleton,
  StatusChip,
  TablePrimitives,
} from '@qovery/shared/ui'
import { dateFullFormat, formatDuration, timeAgo } from '@qovery/shared/util-dates'
import { useAgenticWorkflowRunHistory } from '../hooks/use-agentic-workflow-run-history/use-agentic-workflow-run-history'

const { Table } = TablePrimitives

type RunStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
type RunWithLifecycle = AgenticWorkflowRun & {
  status?: RunStatus
  started_at?: string | null
  finished_at?: string | null
  duration_ms?: number | null
  payload?: string | null
}

const RUN_STATUS_CONFIG: Record<
  RunStatus,
  {
    label: string
    iconStatus: 'QUEUED' | 'ONGOING' | 'COMPLETED' | 'ERROR' | 'CANCELED'
  }
> = {
  QUEUED: { label: 'Queued', iconStatus: 'QUEUED' },
  RUNNING: { label: 'Running', iconStatus: 'ONGOING' },
  COMPLETED: { label: 'Completed', iconStatus: 'COMPLETED' },
  FAILED: { label: 'Failed', iconStatus: 'ERROR' },
  CANCELLED: { label: 'Cancelled', iconStatus: 'CANCELED' },
}

const RUN_TRIGGER_ICONS: Record<AgenticWorkflowRun['trigger'], IconName> = {
  [AgenticWorkflowRunTrigger.MANUAL]: 'play',
  [AgenticWorkflowRunTrigger.SCHEDULE]: 'calendar-day',
  [AgenticWorkflowRunTrigger.WEBHOOK]: 'webhook',
}

function runStatus(status?: RunStatus, spaceBetween = false) {
  if (!status) return '—'

  const { label, iconStatus } = RUN_STATUS_CONFIG[status]

  return (
    <span
      className={spaceBetween ? 'flex w-full items-center justify-between gap-2' : 'inline-flex items-center gap-2'}
    >
      <span className="text-neutral">{label}</span>
      <StatusChip status={iconStatus} disabledTooltip />
    </span>
  )
}

function runDuration(duration?: number | null) {
  if (duration == null) return '—'
  if (duration < 1000) return `${duration}ms`

  const totalSeconds = Math.floor(duration / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const formattedDuration = formatDuration(`PT${hours}H${minutes}M${seconds}S`)
  const milliseconds = duration % 1000

  return milliseconds
    ? `${formattedDuration}.${String(milliseconds).padStart(3, '0').replace(/0+$/, '')}`
    : formattedDuration
}

function RunDuration({ duration }: { duration?: number | null }) {
  if (duration == null) return <span className="text-neutral-subtle">—</span>

  return (
    <span className="flex items-center gap-1 text-neutral-subtle">
      <Icon iconName="clock-eight" iconStyle="regular" />
      {runDuration(duration)}
    </span>
  )
}

function triggerLabel(trigger: AgenticWorkflowRun['trigger']) {
  return {
    [AgenticWorkflowRunTrigger.MANUAL]: 'Manual',
    [AgenticWorkflowRunTrigger.SCHEDULE]: 'Schedule',
    [AgenticWorkflowRunTrigger.WEBHOOK]: 'Webhook',
  }[trigger]
}

function RunTrigger({ trigger }: { trigger: AgenticWorkflowRun['trigger'] }) {
  return (
    <span className="flex items-center gap-2">
      <Icon iconName={RUN_TRIGGER_ICONS[trigger]} iconStyle="regular" />
      {triggerLabel(trigger)}
    </span>
  )
}

function runDate(value: string | null) {
  return value ? dateFullFormat(value, 'UTC', 'dd MMM, HH:mm') : '—'
}

function runEndDate(startedAt: string, finishedAt: string) {
  const sameUtcDay = new Date(startedAt).toISOString().slice(0, 10) === new Date(finishedAt).toISOString().slice(0, 10)
  return dateFullFormat(finishedAt, 'UTC', sameUtcDay ? 'HH:mm' : 'dd MMM, HH:mm')
}

function promptPreview(prompt: string) {
  const normalized = prompt.replace(/\s+/g, ' ').trim()
  return normalized.length > 30 ? `${normalized.slice(0, 30)}…` : normalized
}

function RunDetails({ run, onClose }: { run: RunWithLifecycle; onClose: () => void }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-overlay bg-background-overlay" />
        <Dialog.Content
          asChild
          aria-describedby={undefined}
          onOpenAutoFocus={(event) => {
            event.preventDefault()
            closeButtonRef.current?.focus()
          }}
        >
          <Sheet
            className="fixed bottom-0 right-0 top-0 z-modal w-[940px] max-w-[calc(100vw-32px)] focus:outline-none"
            aria-label="Run details"
          >
            <div className="flex-1 overflow-auto px-6 pb-24 pt-6">
              <Dialog.Title className="mb-8 pr-8 text-2xl font-medium leading-8 text-neutral">
                Run {run.id.slice(0, 8)}
              </Dialog.Title>
              <div className="flex flex-col gap-6 text-sm">
                <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3">
                  <dt className="text-neutral-subtle">Run ID</dt>
                  <dd className="flex min-w-0 items-center gap-2">
                    <span className="break-all font-mono text-xs">{run.id}</span>
                    <CopyToClipboardButtonIcon content={run.id} tooltipContent="Copy run ID" asButton />
                  </dd>
                  <dt className="text-neutral-subtle">Trigger</dt>
                  <dd>
                    <RunTrigger trigger={run.trigger} />
                  </dd>
                  <dt className="text-neutral-subtle">Requested (UTC)</dt>
                  <dd>{runDate(run.created_at)}</dd>
                  <dt className="text-neutral-subtle">Status</dt>
                  <dd>{runStatus(run.status)}</dd>
                  <dt className="text-neutral-subtle">Started (UTC)</dt>
                  <dd>{runDate(run.started_at ?? null)}</dd>
                  <dt className="text-neutral-subtle">Finished (UTC)</dt>
                  <dd>{runDate(run.finished_at ?? null)}</dd>
                  <dt className="text-neutral-subtle">Duration</dt>
                  <dd>
                    <RunDuration duration={run.duration_ms} />
                  </dd>
                </dl>
                <section className="flex flex-col gap-2">
                  <Heading level={3}>Prompt</Heading>
                  <p className="whitespace-pre-wrap rounded border border-neutral p-4">
                    {run.prompt?.trim() ? run.prompt : 'No prompt recorded.'}
                  </p>
                </section>
                <section className="flex flex-col gap-2">
                  <Heading level={3}>Payload</Heading>
                  <p className="whitespace-pre-wrap break-words rounded border border-neutral p-4">
                    {run.payload === null || run.payload === undefined
                      ? 'No payload recorded.'
                      : run.payload || 'Empty payload.'}
                  </p>
                </section>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                ref={closeButtonRef}
                type="button"
                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded text-neutral-subtle hover:bg-surface-neutral-subtle hover:text-neutral"
                aria-label="Close run details"
              >
                <Icon iconName="xmark" />
              </button>
            </Dialog.Close>
          </Sheet>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export function AgenticWorkflowRuns({ serviceId }: { serviceId: string }) {
  const [selectedRun, setSelectedRun] = useState<RunWithLifecycle | null>(null)
  const { data: runs = [], isLoading, isError, refetch } = useAgenticWorkflowRunHistory({ serviceId })
  const runsWithLifecycle: RunWithLifecycle[] = runs

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
      <Table.Root className="w-full min-w-[1400px] table-fixed overflow-x-scroll text-ssm">
        <Table.Header>
          <Table.Row className="divide-x divide-neutral">
            <Table.ColumnHeaderCell className="w-[420px] font-medium">Date</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="w-[128px] font-medium">Status</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="w-[196px] font-medium">Trigger</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="font-medium">Payload</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="w-[112px] font-medium">Duration</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="w-[272px] font-medium">Prompt</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {runsWithLifecycle.map((run) => (
            <Table.Row
              key={run.id}
              role="button"
              className="h-[68px] cursor-pointer divide-x divide-neutral border-neutral hover:bg-surface-neutral-subtle focus:bg-surface-neutral-subtle"
              tabIndex={0}
              onClick={() => setSelectedRun(run)}
              onKeyDown={(event) => openRunWithKeyboard(event, run)}
            >
              <Table.Cell className="w-[420px]">
                <div className="flex flex-col gap-0.5">
                  <span className="flex items-center gap-1 text-sm font-medium text-neutral">
                    <span title={run.started_at ? 'Started (UTC)' : 'Requested (UTC)'}>
                      {runDate(run.started_at ?? run.created_at)}
                    </span>
                    {run.started_at && run.finished_at && (
                      <>
                        <Icon iconName="arrow-right" className="text-xs text-neutral-subtle" />
                        <span title="Finished (UTC)">{runEndDate(run.started_at, run.finished_at)}</span>
                      </>
                    )}
                  </span>
                  <span className="group flex min-w-0 items-center gap-0.5 text-ssm text-neutral-subtle">
                    <span className="truncate" title={run.id}>
                      {run.id}
                    </span>
                    <span onClick={(event) => event.stopPropagation()}>
                      <CopyToClipboardButtonIcon
                        content={run.id}
                        tooltipContent="Copy run ID"
                        tooltipOpen={selectedRun ? false : undefined}
                        asButton
                        className="shrink-0 opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100"
                        iconClassName="text-xs"
                      />
                    </span>
                  </span>
                </div>
              </Table.Cell>
              <Table.Cell className="w-[128px]">{runStatus(run.status, true)}</Table.Cell>
              <Table.Cell className="w-[196px]">
                <RunTrigger trigger={run.trigger} />
              </Table.Cell>
              <Table.Cell>
                {run.payload === null || run.payload === undefined ? (
                  '—'
                ) : run.payload === '' ? (
                  'Empty payload'
                ) : (
                  <Button
                    color="neutral"
                    variant="plain"
                    size="md"
                    aria-label="See the full payload"
                    onClick={(event) => {
                      event.stopPropagation()
                      setSelectedRun(run)
                    }}
                  >
                    {promptPreview(run.payload) || 'Whitespace-only payload'}
                  </Button>
                )}
              </Table.Cell>
              <Table.Cell className="w-[112px]">
                <RunDuration duration={run.duration_ms} />
              </Table.Cell>
              <Table.Cell className="w-[272px]">
                {run.prompt?.trim() ? (
                  <Button
                    color="neutral"
                    variant="plain"
                    size="md"
                    aria-label="See the full prompt"
                    onClick={(event) => {
                      event.stopPropagation()
                      setSelectedRun(run)
                    }}
                  >
                    {promptPreview(run.prompt)}
                  </Button>
                ) : (
                  '—'
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      {selectedRun && <RunDetails run={selectedRun} onClose={() => setSelectedRun(null)} />}
    </div>
  )
}

export function AgenticWorkflowLastRun({ serviceId }: { serviceId: string }) {
  const [selectedRun, setSelectedRun] = useState<RunWithLifecycle | null>(null)
  const { data: runs = [], isLoading, isError, refetch } = useAgenticWorkflowRunHistory({ serviceId, limit: 1 })
  const lastRun: RunWithLifecycle | undefined = runs[0]

  if (isLoading) {
    return (
      <div
        className="flex gap-2.5 rounded-lg border border-neutral bg-surface-neutral p-4"
        aria-label="Loading last run"
      >
        <Skeleton width={100} height={16} />
        <Skeleton width={100} height={16} />
        <Skeleton width={150} height={16} />
      </div>
    )
  }

  if (isError) {
    return (
      <EmptyState size="sm" icon="triangle-exclamation" title="Last run could not be loaded">
        <Button color="neutral" variant="outline" size="md" onClick={() => refetch()}>
          Retry
        </Button>
      </EmptyState>
    )
  }

  if (!lastRun) {
    return (
      <EmptyState
        size="sm"
        icon="play"
        title="No runs yet"
        description="Trigger this agent task to see its latest run."
      />
    )
  }

  return (
    <>
      <button
        type="button"
        className="relative flex w-full rounded-lg border border-neutral bg-surface-neutral p-4 text-left transition-colors hover:bg-surface-neutral-subtle"
        onClick={() => setSelectedRun(lastRun)}
      >
        <span className="flex flex-wrap items-center gap-2.5 text-sm text-neutral">
          <span className="flex items-center gap-1 font-medium">
            <RunTrigger trigger={lastRun.trigger} /> run
          </span>
          <span className="h-[3px] w-[3px] rounded-full bg-neutral-disabled" aria-hidden="true" />
          <span className="text-neutral-subtle">{timeAgo(new Date(lastRun.created_at))} ago</span>
          {lastRun.status && (
            <>
              <span className="h-[3px] w-[3px] rounded-full bg-neutral-disabled" aria-hidden="true" />
              <span className="text-neutral-subtle">{runStatus(lastRun.status)}</span>
            </>
          )}
          {lastRun.prompt?.trim() && (
            <>
              <span className="h-[3px] w-[3px] rounded-full bg-neutral-disabled" aria-hidden="true" />
              <span className="max-w-full truncate text-neutral-subtle">{promptPreview(lastRun.prompt)}</span>
            </>
          )}
        </span>
      </button>
      {selectedRun && <RunDetails run={selectedRun} onClose={() => setSelectedRun(null)} />}
    </>
  )
}
