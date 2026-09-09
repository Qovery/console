import * as Dialog from '@radix-ui/react-dialog'
import { useState } from 'react'
import { Accordion, Button, CopyToClipboardButtonIcon, Heading, Section, Sheet, StatusChip } from '@qovery/shared/ui'
import { formatCronExpression } from '@qovery/shared/util-js'
import { type AgentTaskRun, MOCK_RUNS, type RunStatus } from './agent-task-runs.mock'

const STATUS_ICONS = {
  QUEUED: 'QUEUED',
  RUNNING: 'EXECUTING',
  COMPLETED: 'COMPLETED',
  FAILED: 'ERROR',
  CANCELLED: 'CANCELED',
} as const
const label = (value: string) => value.charAt(0) + value.slice(1).toLowerCase()
const triggerLabel = (run: AgentTaskRun) =>
  run.trigger === 'SCHEDULE' && run.schedule
    ? `${formatCronExpression(run.schedule.cron_expression) || run.schedule.cron_expression} (${run.schedule.timezone})`
    : label(run.trigger)
const date = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat('en-GB', {
        timeZone: 'UTC',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(new Date(value))
    : '—'
const duration = (value: number | null) =>
  value === null
    ? '—'
    : value < 60000
      ? `${Math.floor(value / 1000)}s`
      : `${Math.floor(value / 60000)}m ${Math.floor((value % 60000) / 1000)}s`

function RunState({ status }: { status: RunStatus }) {
  return (
    <span className="inline-flex items-center gap-2">
      <StatusChip status={STATUS_ICONS[status]} disabledTooltip />
      {label(status)}
    </span>
  )
}

export function AgentTaskRuns({
  agentTaskId,
  agentTaskName,
  grouped = false,
  limit,
}: {
  agentTaskId?: string
  agentTaskName?: string
  grouped?: boolean
  limit?: number
}) {
  const [selected, setSelected] = useState<AgentTaskRun | null>(null)
  const scoped =
    agentTaskId && agentTaskName
      ? MOCK_RUNS.map((run) => ({ ...run, agent_task_id: agentTaskId, agent_task_name: agentTaskName }))
      : MOCK_RUNS.filter((run) => !agentTaskId || run.agent_task_id === agentTaskId)
  const agents = [...new Map(scoped.map((run) => [run.agent_task_id, run.agent_task_name])).entries()]
  const runs = [...scoped].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)).slice(0, limit)
  if (grouped)
    return (
      <Section className="gap-8">
        {agents.map(([id, name]) => (
          <Section key={id} className="gap-3">
            <Heading level={2}>{name}</Heading>
            <AgentTaskRuns agentTaskId={id} />
          </Section>
        ))}
      </Section>
    )

  return (
    <Section className="gap-4">
      <div className="overflow-x-auto rounded-lg border border-neutral">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral bg-surface-neutral-subtle font-mono text-xs text-neutral-subtle">
            <tr>
              {['Run ID', ...(!agentTaskId ? ['Agent Task'] : []), 'Status', 'Trigger', 'Started', 'Duration'].map(
                (title) => (
                  <th key={title} className="whitespace-nowrap px-4 py-3 font-normal">
                    {title}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr
                key={run.deployment_id}
                className="cursor-pointer border-b border-neutral last:border-0 hover:bg-surface-neutral-subtle"
                onClick={() => setSelected(run)}
              >
                <td className="px-4 py-4">
                  <button
                    type="button"
                    className="font-mono text-xs hover:underline"
                    onClick={() => setSelected(run)}
                    aria-label={`Open run ${run.deployment_id}`}
                  >
                    {run.deployment_id.slice(0, 8)}
                  </button>
                </td>
                {!agentTaskId && <td className="px-4 py-4 font-medium">{run.agent_task_name}</td>}
                <td className="whitespace-nowrap px-4 py-4">
                  <RunState status={run.status} />
                </td>
                <td className="px-4 py-4">{triggerLabel(run)}</td>
                <td className="whitespace-nowrap px-4 py-4">{date(run.started_at)}</td>
                <td className="whitespace-nowrap px-4 py-4 font-mono text-xs">{duration(run.duration_ms)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {runs.length === 0 && <div className="p-8 text-center text-sm text-neutral-subtle">No runs yet</div>}
      </div>
      {selected && (
        <Dialog.Root
          open
          onOpenChange={(open) => {
            if (!open) setSelected(null)
          }}
        >
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-overlay bg-background-overlay" />
            <Dialog.Content asChild aria-describedby={undefined}>
              <Sheet className="fixed bottom-0 right-0 top-0 z-modal w-full max-w-2xl" aria-label="Run details">
                <div className="flex items-center justify-between border-b border-neutral p-6">
                  <Dialog.Title asChild>
                    <Heading level={2}>Run {selected.deployment_id.slice(0, 8)}</Heading>
                  </Dialog.Title>
                  <Button color="neutral" variant="outline" onClick={() => setSelected(null)}>
                    Close
                  </Button>
                </div>
                <div className="flex flex-col gap-6 overflow-y-auto p-6 text-sm">
                  <div className="flex items-center gap-3">
                    <RunState status={selected.status} />
                  </div>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3">
                    <dt className="text-neutral-subtle">Deployment ID</dt>
                    <dd className="flex min-w-0 items-center gap-2">
                      <span className="break-all font-mono text-xs">{selected.deployment_id}</span>
                      <CopyToClipboardButtonIcon content={selected.deployment_id} />
                    </dd>
                    {Object.entries({
                      'Agent Task': selected.agent_task_name,
                      'Agent Task ID': selected.agent_task_id,
                      Trigger: triggerLabel(selected),
                      'Created (UTC)': date(selected.created_at),
                      'Started (UTC)': date(selected.started_at),
                      'Finished (UTC)': date(selected.finished_at),
                      Duration: duration(selected.duration_ms),
                    }).map(([key, value]) => (
                      <div key={key} className="contents">
                        <dt className="text-neutral-subtle">{key}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                  <section className="flex flex-col gap-2">
                    <Heading level={3}>Prompt</Heading>
                    <p className="whitespace-pre-wrap rounded border border-neutral p-4">
                      {selected.prompt ?? 'Prompt unavailable.'}
                    </p>
                  </section>
                  <section className="flex flex-col gap-2">
                    <Heading level={3}>{selected.error ? 'Error' : 'Result'}</Heading>
                    <p className="whitespace-pre-wrap rounded border border-neutral p-4">
                      {selected.error ??
                        selected.result ??
                        (selected.status === 'QUEUED'
                          ? 'Waiting to start.'
                          : selected.status === 'RUNNING'
                            ? 'Execution in progress.'
                            : selected.status === 'CANCELLED'
                              ? 'This run was cancelled.'
                              : 'No result available.')}
                    </p>
                  </section>
                  <Accordion.Root type="single" collapsible className="rounded border border-neutral">
                    <Accordion.Item value="logs">
                      <Accordion.Trigger className="w-full cursor-pointer flex-row-reverse justify-between px-4 font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-strong">
                        Sample logs
                      </Accordion.Trigger>
                      <Accordion.Content>
                        <pre className="whitespace-pre-wrap px-4 pb-4 font-mono text-xs text-neutral-subtle">{`[demo] Execution requested via ${selected.trigger.toLowerCase()}.\n[demo] Status: ${label(selected.status)}.\n${selected.error ? `[demo] ${selected.error}` : '[demo] Live logs will be available when the Runs API is connected.'}`}</pre>
                      </Accordion.Content>
                    </Accordion.Item>
                  </Accordion.Root>
                </div>
              </Sheet>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </Section>
  )
}
