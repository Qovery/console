import { type IconName } from '@fortawesome/fontawesome-common-types'
import * as Dialog from '@radix-ui/react-dialog'
import { useParams } from '@tanstack/react-router'
import { useState } from 'react'
import { PolicyApiTokenCrudModal } from '@qovery/domains/organizations/feature'
import { AGENTIC_WORKFLOW_TEMPLATES } from '@qovery/domains/services/feature'
import {
  Badge,
  Button,
  Callout,
  CopyButton,
  ExternalLink,
  Heading,
  Icon,
  Link,
  Section,
  SegmentedControl,
  Sheet,
  useModal,
} from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { useCanManageSkillPresets } from '../hooks/use-can-manage-skill-presets/use-can-manage-skill-presets'
import { useSkillPresetAssignees } from '../hooks/use-skill-preset-assignees/use-skill-preset-assignees'
import { AGENT_JOBS, AGENT_JOB_LEVELS, type AgentJob, policyExampleUrl } from '../utils/agent-jobs'
import { NEW_JOB_TITLE, NewJobModal } from './new-job-modal'
import { AgentExperiencePage, CodingAgentLogos } from './ui/agent-experience-ui'

export const AGENT_JOB_WHERE =
  'This agent runs where you start it: as an Agent Task on your Qovery infrastructure, or from a coding agent on a laptop or in CI.'

/** The Agent Tasks templates that run an agent on Qovery itself. */
const AGENT_TASK_IDS = [
  'incident-io-analyzer',
  'honeybadger-incident-analyzer',
  'build-optimizer',
  'jira-coding-agent',
  'linear-coding-agent',
]

const JOB_ICONS: Record<string, IconName> = {
  'investigate-production-incident': 'magnifying-glass',
  'fix-in-preview-environment': 'flask',
  'stop-idle-environments': 'moon',
  'clean-up-preview-environments': 'broom',
  'right-size-applications': 'arrows-minimize',
  'roll-back-bad-release': 'clock-rotate-left',
  'scale-before-traffic-peak': 'chart-line-up',
  'patch-security-issue': 'shield-halved',
  'test-on-production-clone': 'clone',
}

// Same card as a blueprint in the service catalog (BlueprintCard), clickable as a whole.
const CARD_CLASS_NAME =
  'flex h-full flex-col gap-3 rounded-lg border border-neutral bg-surface-neutral p-4 text-left [box-shadow:0px_0px_4px_0px_rgba(0,0,0,0.01),0px_2px_3px_0px_rgba(0,0,0,0.02)]'

/**
 * The safety level as a badge. "Investigate" rather than "Read-only": one of its jobs deploys to
 * preview environments.
 */
const LEVEL_BADGES: Record<AgentJob['level'], string> = {
  investigate: 'Investigate',
  hygiene: 'Hygiene',
  cost: 'Cost',
  reliability: 'Reliability',
  change: 'Change',
}

export function LevelBadge({ job }: { job: AgentJob }) {
  return (
    <Badge size="sm" color="neutral" variant="outline" data-testid="agent-job-level">
      {LEVEL_BADGES[job.level]}
    </Badge>
  )
}

function JobIcon({ job, size = 'md' }: { job: AgentJob; size?: 'md' | 'lg' }) {
  return (
    <span
      className={
        size === 'lg'
          ? 'flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-brand-subtle text-base text-brand'
          : 'flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-brand-subtle text-brand'
      }
    >
      <Icon iconName={JOB_ICONS[job.slug] ?? 'robot'} iconStyle="regular" aria-hidden="true" />
    </span>
  )
}

function JobCard({ job, onViewDetails }: { job: AgentJob; onViewDetails: (job: AgentJob) => void }) {
  return (
    <button
      type="button"
      className={`${CARD_CLASS_NAME} group transition-colors hover:border-neutral-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-strong`}
      onClick={() => onViewDetails(job)}
      data-testid={`agent-job-${job.slug}`}
      aria-label={`${job.title}: view details`}
    >
      <span className="flex w-full items-start justify-between gap-2">
        <JobIcon job={job} />
        <span className="ml-auto">
          <LevelBadge job={job} />
        </span>
        <Icon
          iconName="chevron-right"
          iconStyle="regular"
          className="text-xs text-neutral-subtle group-hover:text-neutral"
          aria-hidden="true"
        />
      </span>
      <span className="flex flex-col gap-1">
        <span className="text-sm font-medium text-neutral">{job.title}</span>
        <span className="text-xs leading-5 text-neutral-subtle">{job.summary}</span>
      </span>
      <TriggerLine trigger={job.trigger} />
    </button>
  )
}

const TRIGGER_ICONS = { schedule: 'calendar-clock', webhook: 'webhook' } as const

/** When the job runs: a schedule or a webhook, the two triggers Agent Tasks support. */
function TriggerLine({ trigger }: { trigger: AgentJob['trigger'] }) {
  return (
    <span className="mt-auto inline-flex items-center gap-1.5 text-xs text-neutral" data-testid="agent-job-trigger">
      <Icon iconName={TRIGGER_ICONS[trigger.kind]} iconStyle="regular" className="text-brand" aria-hidden="true" />
      {trigger.label}
    </span>
  )
}

const MCP_URL = 'https://mcp.qovery.com/mcp'

/** A value to copy, in full (it wraps instead of being cut), with a copy button named after it. */
function CopyValue({ label, value, copyLabel }: { label: string; value: string; copyLabel: string }) {
  return (
    <span className="flex items-start justify-between gap-2 rounded border border-neutral bg-surface-neutral-subtle px-2 py-1">
      <span className="min-w-0 break-all py-1 text-xs">
        <span className="text-neutral-subtle">{label}: </span>
        <code className="font-code text-neutral">{value}</code>
      </span>
      <CopyButton content={value} aria-label={copyLabel} />
    </span>
  )
}

/**
 * How the job runs without anyone: first its policy token, then a scheduler. The Agent Task form is
 * not prefilled from here: it only takes its own templates, and the Qovery MCP server needs the token
 * value, shown once at creation. So the steps give each value to copy.
 */
function RunOnItsOwn({
  job,
  canManage,
  organizationId,
  adminNames,
}: {
  job: AgentJob
  canManage: boolean
  organizationId: string
  adminNames: string[]
}) {
  return (
    <Section
      aria-labelledby="agent-job-run"
      className="flex flex-col gap-4 rounded-md border border-neutral bg-surface-neutral-subtle p-4"
      data-testid="agent-job-run"
    >
      <Heading level={3} id="agent-job-run">
        Run it on its own
      </Heading>
      <ol className="flex flex-col gap-4 text-sm text-neutral">
        <li className="flex items-start gap-3">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-brand-subtle text-xs font-medium text-brand">
            1
          </span>
          <span className="flex flex-col gap-2">
            <span>
              <span className="font-medium">Create its policy token.</span> It allows exactly this job. The token is
              shown once: keep it for the next step.
              {canManage && ' Use Create policy token at the bottom of this panel.'}
            </span>
            {!canManage && (
              <Callout.Root color="neutral" data-testid="agent-job-member-note">
                <Callout.Icon>
                  <Icon iconName="lock-keyhole" iconStyle="regular" />
                </Callout.Icon>
                <Callout.Text>
                  <Callout.TextDescription>
                    Only owners and admins create policy tokens.
                    {adminNames.length > 0
                      ? ` Send this job to one of them: ${adminNames.join(', ')}.`
                      : ' Send this job to one of them.'}
                  </Callout.TextDescription>
                </Callout.Text>
              </Callout.Root>
            )}
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-brand-subtle text-xs font-medium text-brand">
            2
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-3">
            <span>
              <span className="font-medium">Schedule the agent.</span> Suggested trigger:{' '}
              <span className="inline-flex items-center gap-1">
                <Icon
                  iconName={TRIGGER_ICONS[job.trigger.kind]}
                  iconStyle="regular"
                  className="text-brand"
                  aria-hidden="true"
                />
                {job.trigger.label}
              </span>
              {job.trigger.note && <span className="text-neutral-subtle">. {job.trigger.note}</span>}
            </span>
            <span className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <span
                className="flex flex-col gap-2 rounded-md border border-neutral bg-surface-neutral p-3"
                data-testid="route-coding-agent"
              >
                <span className="font-medium">From your coding agent</span>
                <CodingAgentLogos />
                <span className="text-xs text-neutral-subtle">
                  Run the job from the coding agent you already use, with the Qovery skills or the Qovery MCP server,
                  signed in with the policy token. Give it the token outside the prompt, never in it:
                </span>
                <CopyValue
                  label="Skills and CLI"
                  value="QOVERY_CLI_ACCESS_TOKEN=<policy token>"
                  copyLabel="Copy the token variable for the coding agent"
                />
                <CopyValue
                  label="Or MCP header"
                  value="Authorization: Token <policy token>"
                  copyLabel="Copy the MCP header for the coding agent"
                />
                <span className="text-xs text-neutral-subtle">
                  To make it recurring, use your coding agent’s own scheduling if it has one, or start it from a CI cron
                  job, with the prompt below.
                </span>
                {job.trigger.kind === 'schedule' && job.trigger.cron ? (
                  <CopyValue
                    label="Schedule"
                    value={job.trigger.cron}
                    copyLabel="Copy the schedule for the coding agent"
                  />
                ) : (
                  <span className="text-xs text-neutral">
                    {job.trigger.note
                      ? `Start it when it happens, ${job.trigger.note.charAt(0).toLowerCase()}${job.trigger.note.slice(1)}`
                      : `Start it ${job.trigger.label.toLowerCase()}.`}
                  </span>
                )}
              </span>
              <span
                className="flex flex-col gap-2 rounded-md border border-brand-strong bg-surface-neutral p-3"
                data-testid="route-agent-task"
              >
                <span className="flex items-center gap-2 font-medium">
                  As an Agent Task on Qovery
                  <Badge size="sm" variant="surface" color="brand">
                    Recommended
                  </Badge>
                </span>
                <span className="text-xs text-neutral">
                  Runs next to your services on its own schedule or webhook, with no laptop or CI to keep running.
                </span>
                <span className="text-xs text-neutral-subtle">
                  This page creates nothing. In the environment where it should run, open Automations and add an Agent
                  Task with the prompt below, this trigger, and the Qovery MCP server set up with the token.
                </span>
                {job.trigger.kind === 'schedule' && job.trigger.cron ? (
                  <CopyValue label="On a schedule" value={job.trigger.cron} copyLabel="Copy the Agent Task schedule" />
                ) : (
                  <span className="text-xs text-neutral">From a webhook: use the URL the Agent Task gets.</span>
                )}
                <CopyValue label="MCP server URL" value={MCP_URL} copyLabel="Copy the MCP server URL" />
                <CopyValue
                  label="Header"
                  value="Authorization: Token <policy token>"
                  copyLabel="Copy the MCP header for the Agent Task"
                />
                <span className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                  {canManage && (
                    <Link
                      to="/organization/$organizationId/agent-experience/mcp-servers"
                      params={{ organizationId }}
                      color="brand"
                      size="xs"
                    >
                      Add the MCP server
                    </Link>
                  )}
                  <Link to="/organization/$organizationId/overview" params={{ organizationId }} color="brand" size="xs">
                    Open Automations in an environment
                  </Link>
                  <ExternalLink href="https://www.qovery.com/docs/configuration/agent-tasks/overview" size="xs">
                    Agent Tasks docs
                  </ExternalLink>
                </span>
              </span>
            </span>
          </span>
        </li>
      </ol>
    </Section>
  )
}

function CodeSection({
  id,
  title,
  code,
  maxHeight,
  copyLabel,
}: {
  id: string
  title: string
  code: string
  maxHeight: string
  copyLabel: string
}) {
  return (
    <Section aria-labelledby={id} className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <Heading level={3} id={id}>
          {title}
        </Heading>
        <CopyButton content={code} aria-label={copyLabel} />
      </div>
      <pre
        className={`${maxHeight} overflow-auto rounded border border-neutral bg-surface-neutral-subtle p-4 font-code text-xs leading-5 text-neutral`}
      >
        {code}
      </pre>
    </Section>
  )
}

/** The job's details, in the same side sheet as a blueprint's (BlueprintDetailsPanel). */
function JobDetailsPanel({
  job,
  open,
  canManage,
  organizationId,
  onOpenChange,
  onExitComplete,
  onNewJob,
}: {
  job: AgentJob | null
  open: boolean
  canManage: boolean
  organizationId: string
  onOpenChange: (open: boolean) => void
  onExitComplete: () => void
  onNewJob: () => void
}) {
  const { openModal, closeModal } = useModal()
  const { data: assignees } = useSkillPresetAssignees({ organizationId })
  // Who a member can send the job to: the organization's owners and admins.
  const adminRoleIds = new Set(
    (assignees?.roles ?? []).filter(({ name }) => ['owner', 'admin'].includes(name.toLowerCase())).map(({ id }) => id)
  )
  const adminNames = (assignees?.members ?? [])
    .filter(({ role_id }) => adminRoleIds.has(role_id ?? ''))
    .map(({ name }) => name)
  if (!job) return null
  const createToken = () => {
    // The sheet is a modal dialog: close it first so the create form gets the focus.
    onOpenChange(false)
    openModal({
      content: (
        <PolicyApiTokenCrudModal
          organizationId={organizationId}
          onClose={closeModal}
          // The example policy, ready to edit: its REPLACE_WITH_... values still need real IDs.
          defaultValues={{ name: job.slug, description: job.does, opa_policy: job.policy }}
        />
      ),
    })
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal forceMount>
        <Dialog.Overlay forceMount className="fixed inset-0 z-overlay bg-background-overlay" />
        <Dialog.Content forceMount asChild>
          <Sheet
            open={open}
            onExited={onExitComplete}
            className="fixed bottom-0 right-0 top-0 z-modal w-[940px] max-w-[calc(100vw-32px)] focus:outline-none"
            data-testid="agent-job-details"
          >
            <div className="flex-1 overflow-auto px-6 pb-24 pt-6">
              <div className="mb-8 flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Dialog.Title className="flex items-center gap-3 pr-8 text-2xl font-medium leading-8 text-neutral">
                    <JobIcon job={job} size="lg" />
                    <span>{job.title}</span>
                  </Dialog.Title>
                  <Dialog.Description className="text-sm leading-5 text-neutral-subtle">{job.does}</Dialog.Description>
                  <p
                    className="flex items-start gap-2 rounded-md bg-surface-neutral-subtle px-3 py-2 text-sm text-neutral"
                    data-testid="agent-job-where"
                  >
                    <Icon
                      iconName="location-dot"
                      iconStyle="regular"
                      className="mt-0.5 text-brand"
                      aria-hidden="true"
                    />
                    {AGENT_JOB_WHERE}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <LevelBadge job={job} />
                  <Badge size="sm" color="neutral" variant="outline" className="gap-1">
                    <Icon iconName={TRIGGER_ICONS[job.trigger.kind]} iconStyle="regular" aria-hidden="true" />
                    {job.trigger.label}
                  </Badge>
                  <Badge size="sm" color="neutral" variant="outline" className="gap-1">
                    <Icon iconName="key" iconStyle="regular" aria-hidden="true" />
                    Policy token
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col gap-8">
                {/* What people come for first: the prompt. */}
                <CodeSection
                  id="agent-job-prompt"
                  title="Prompt for the agent"
                  code={job.prompt}
                  maxHeight="max-h-72"
                  copyLabel="Copy prompt"
                />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Section aria-labelledby="agent-job-can" className="flex flex-col gap-2">
                    <Heading level={3} id="agent-job-can">
                      The agent can
                    </Heading>
                    <ul className="flex flex-col gap-1.5 text-sm text-neutral">
                      {job.can.map((line) => (
                        <li key={line} className="flex items-start gap-2">
                          <Icon
                            iconName="check"
                            iconStyle="regular"
                            className="mt-1 text-positive"
                            aria-hidden="true"
                          />
                          {line}
                        </li>
                      ))}
                    </ul>
                  </Section>
                  <Section aria-labelledby="agent-job-cannot" className="flex flex-col gap-2">
                    <Heading level={3} id="agent-job-cannot">
                      It can never
                    </Heading>
                    <ul className="flex flex-col gap-1.5 text-sm text-neutral">
                      {job.cannot.map((line) => (
                        <li key={line} className="flex items-start gap-2">
                          <Icon iconName="ban" iconStyle="regular" className="mt-1 text-negative" aria-hidden="true" />
                          {line}
                        </li>
                      ))}
                    </ul>
                  </Section>
                </div>
                <p className="text-sm text-neutral-subtle">
                  Anything the policy does not allow is refused by the Qovery API, from the Console, the CLI, Terraform
                  or MCP, and every call is in the audit logs.
                </p>
                <RunOnItsOwn job={job} canManage={canManage} organizationId={organizationId} adminNames={adminNames} />
                <CodeSection
                  id="agent-job-policy"
                  title="Policy (Rego)"
                  code={job.policy}
                  maxHeight="max-h-80"
                  copyLabel="Copy policy"
                />
                <p className="text-xs text-neutral-subtle">
                  Replace each REPLACE_WITH_... value with an ID from your organization before you create the token.
                </p>
                <p className="flex flex-wrap items-center gap-1 text-sm text-neutral-subtle">
                  Need a different job?
                  <Button
                    type="button"
                    variant="plain"
                    color="brand"
                    size="xs"
                    className="h-auto px-0 text-sm"
                    onClick={() => {
                      onOpenChange(false)
                      onNewJob()
                    }}
                  >
                    Describe it
                  </Button>
                </p>
              </div>
            </div>

            <Dialog.Close asChild>
              <button
                type="button"
                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded text-neutral-subtle hover:bg-surface-neutral-subtle hover:text-neutral"
                aria-label="Close job details"
              >
                <Icon iconName="xmark" />
              </button>
            </Dialog.Close>

            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-end gap-2 border-t border-neutral bg-background px-6 py-4">
              <ExternalLink href={policyExampleUrl(job.slug)} size="sm" className="mr-auto">
                Read the example
              </ExternalLink>
              {canManage && (
                <Button type="button" size="lg" className="gap-1.5" onClick={createToken}>
                  <Icon iconName="key" iconStyle="regular" />
                  Create policy token
                </Button>
              )}
            </div>
          </Sheet>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

/**
 * Jobs agents can run on their own, safest first, from the docs' policy examples. Laid out like the
 * blueprints catalog: groups of cards, a search, and a side sheet with the details. Members get the
 * same catalog without the create action.
 */
export function AgentExperienceAutomate() {
  const { organizationId = '' } = useParams({ strict: false })
  const { canManage } = useCanManageSkillPresets({ organizationId })
  const [level, setLevel] = useState<'all' | AgentJob['level']>('all')
  const [selectedJob, setSelectedJob] = useState<AgentJob | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const agentTasks = AGENT_TASK_IDS.flatMap((id) => AGENTIC_WORKFLOW_TEMPLATES.filter((item) => item.id === id))
  useDocumentTitle('Automate - Agents')

  // One grid, safest first (the jobs are listed in level order).
  const jobs = AGENT_JOBS.filter((job) => level === 'all' || job.level === level)

  const { openModal: openNewJobModal, closeModal: closeNewJobModal } = useModal()
  const openNewJob = () =>
    openNewJobModal({
      content: <NewJobModal onClose={closeNewJobModal} canManage={canManage} />,
      options: { width: 680 },
    })

  const openDetails = (job: AgentJob) => {
    setSelectedJob(job)
    setIsDetailsOpen(true)
  }

  return (
    <AgentExperiencePage
      title="Automate"
      description="Agents that run on their own, each with a token that allows only its job."
    >
      <Section className="gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SegmentedControl.Root
            value={level}
            onValueChange={(value) => setLevel(value as typeof level)}
            aria-label="Safety level"
          >
            <SegmentedControl.Item value="all" className="text-xs">
              All
            </SegmentedControl.Item>
            {AGENT_JOB_LEVELS.map((item) => (
              <SegmentedControl.Item key={item.level} value={item.level} className="text-xs">
                {item.title}
              </SegmentedControl.Item>
            ))}
          </SegmentedControl.Root>
          {/* Members cannot create the policy token a job needs: no button for them. */}
          {canManage && (
            <Button type="button" size="md" variant="outline" color="neutral" className="gap-1.5" onClick={openNewJob}>
              <Icon iconName="circle-plus" iconStyle="regular" />
              {NEW_JOB_TITLE}
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3" data-testid="agent-job-grid">
          {jobs.map((job) => (
            <JobCard key={job.slug} job={job} onViewDetails={openDetails} />
          ))}
        </div>
      </Section>

      <Section aria-labelledby="run-agents-on-qovery" className="gap-2">
        <div className="flex flex-col gap-0.5">
          <Heading level={2} id="run-agents-on-qovery">
            Agent Tasks templates
          </Heading>
          <p className="text-sm text-neutral-subtle">
            Ready-made agents that run next to your services, on a schedule or a webhook. Create one from an
            environment’s Automations tab.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {agentTasks.map((task) => (
            <a
              key={task.id}
              href={task.docLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`${CARD_CLASS_NAME} group transition-colors hover:border-neutral-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-strong`}
              aria-label={`${task.title}: documentation, opens in a new tab`}
            >
              <span className="flex w-full items-start justify-between gap-2">
                <span className="flex h-9 w-9 items-center justify-center">
                  {task.logoPath ? (
                    <img src={task.logoPath} alt="" className="h-6 w-6 object-contain" />
                  ) : (
                    <Icon iconName={task.iconName ?? 'robot'} iconStyle="regular" className="text-xl text-brand" />
                  )}
                </span>
                <Icon
                  iconName="arrow-up-right-from-square"
                  iconStyle="regular"
                  className="text-xs text-neutral-subtle group-hover:text-neutral"
                  aria-hidden="true"
                />
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-sm font-medium text-neutral">{task.title}</span>
                <span className="text-xs leading-5 text-neutral-subtle">{task.description}</span>
              </span>
            </a>
          ))}
        </div>
      </Section>
      <JobDetailsPanel
        job={selectedJob}
        open={isDetailsOpen}
        canManage={canManage}
        organizationId={organizationId}
        onOpenChange={setIsDetailsOpen}
        onExitComplete={() => setSelectedJob(null)}
        onNewJob={openNewJob}
      />
    </AgentExperiencePage>
  )
}
