import { type IconName } from '@fortawesome/fontawesome-common-types'
import * as Dialog from '@radix-ui/react-dialog'
import { useParams } from '@tanstack/react-router'
import { useState } from 'react'
import { PolicyApiTokenCrudModal } from '@qovery/domains/organizations/feature'
import { AGENTIC_WORKFLOW_TEMPLATES } from '@qovery/domains/services/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import {
  Badge,
  Button,
  CopyButton,
  ExternalLink,
  Heading,
  Icon,
  InputSearch,
  Section,
  Sheet,
  useModal,
} from '@qovery/shared/ui'
import { useCopyToClipboard, useDocumentTitle } from '@qovery/shared/util-hooks'
import { useCanManageSkillPresets } from '../hooks/use-can-manage-skill-presets/use-can-manage-skill-presets'
import { MockScenarioBanner } from '../mock-scenario-banner/mock-scenario-banner'
import { AGENT_JOBS, AGENT_JOB_LEVELS, type AgentJob, policyExampleUrl } from '../utils/agent-jobs'

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

export const POLICY_TOKEN_SKILL_LINE =
  'Describe the job in plain English, and the qovery-policy-token skill writes and tests the policy.'

// Same card as a blueprint in the service catalog (BlueprintCard), clickable as a whole.
const CARD_CLASS_NAME =
  'flex h-full flex-col gap-3 rounded-lg border border-neutral bg-surface-neutral p-4 text-left [box-shadow:0px_0px_4px_0px_rgba(0,0,0,0.01),0px_2px_3px_0px_rgba(0,0,0,0.02)]'

const levelTitle = (job: AgentJob) => AGENT_JOB_LEVELS.find(({ level }) => level === job.level)?.title ?? job.level
const levelNumber = (job: AgentJob) => AGENT_JOB_LEVELS.findIndex(({ level }) => level === job.level) + 1

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
        <Icon
          iconName="chevron-right"
          iconStyle="regular"
          className="text-xs text-neutral-subtle group-hover:text-neutral"
          aria-hidden="true"
        />
      </span>
      <span className="flex flex-col gap-1">
        <span className="text-sm font-medium text-neutral">{job.title}</span>
        <span className="line-clamp-2 text-xs leading-5 text-neutral-subtle">{job.does}</span>
      </span>
    </button>
  )
}

function CodeSection({ id, title, code, maxHeight }: { id: string; title: string; code: string; maxHeight: string }) {
  return (
    <Section aria-labelledby={id} className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <Heading level={3} id={id}>
          {title}
        </Heading>
        <CopyButton content={code} />
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
}: {
  job: AgentJob | null
  open: boolean
  canManage: boolean
  organizationId: string
  onOpenChange: (open: boolean) => void
  onExitComplete: () => void
}) {
  const { openModal, closeModal } = useModal()
  const [, copy] = useCopyToClipboard()
  const [copied, setCopied] = useState(false)
  if (!job) return null

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
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge size="sm" color="neutral" variant="outline">
                    Level {levelNumber(job)} of {AGENT_JOB_LEVELS.length}: {levelTitle(job)}
                  </Badge>
                  <Badge size="sm" color="neutral" variant="outline" className="gap-1">
                    <Icon iconName="key" iconStyle="regular" aria-hidden="true" />
                    Policy token
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col gap-8">
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
                <CodeSection
                  id="agent-job-prompt"
                  title="Prompt for the agent"
                  code={job.prompt}
                  maxHeight="max-h-72"
                />
                <CodeSection id="agent-job-policy" title="Policy (Rego)" code={job.policy} maxHeight="max-h-80" />
                <p className="text-xs text-neutral-subtle">
                  Replace each REPLACE_WITH_... value with an ID from your organization before you create the token.
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
              <Button
                type="button"
                variant="outline"
                color="neutral"
                size="lg"
                className="gap-1.5"
                onClick={() => {
                  copy(job.prompt)
                  setCopied(true)
                  window.setTimeout(() => setCopied(false), 2000)
                }}
              >
                <Icon iconName={copied ? 'check' : 'copy'} iconStyle="regular" />
                {copied ? 'Copied' : 'Copy prompt'}
              </Button>
              {canManage && (
                <Button
                  type="button"
                  size="lg"
                  className="gap-1.5"
                  onClick={() => {
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
                  }}
                >
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
  const [search, setSearch] = useState('')
  const [selectedJob, setSelectedJob] = useState<AgentJob | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const agentTasks = AGENT_TASK_IDS.flatMap((id) => AGENTIC_WORKFLOW_TEMPLATES.filter((item) => item.id === id))
  useDocumentTitle('Automate - Agent Experience')

  const query = search.trim().toLowerCase()
  const matches = (job: AgentJob) =>
    !query || [job.title, job.does, levelTitle(job)].some((text) => text.toLowerCase().includes(query))
  const levels = AGENT_JOB_LEVELS.map((level, index) => ({
    ...level,
    number: index + 1,
    jobs: AGENT_JOBS.filter((job) => job.level === level.level && matches(job)),
  })).filter(({ jobs }) => jobs.length > 0)

  const openDetails = (job: AgentJob) => {
    setSelectedJob(job)
    setIsDetailsOpen(true)
  }

  return (
    <Section className="px-8 pb-8 pt-6">
      <SettingsHeading
        title="Automate"
        description="Jobs agents can run on their own, safest first. Each comes with a policy token that allows exactly what the job needs. Anything else is refused at the API, and every call is logged."
      />
      <div className="flex flex-col gap-8">
        <MockScenarioBanner />
        <Section className="gap-4">
          <div className="flex items-center justify-between gap-3">
            <Heading level={2}>Jobs for agents</Heading>
            <InputSearch
              placeholder="Search jobs..."
              className="w-60"
              customSize="h-9 text-sm"
              value={search}
              onChange={setSearch}
              ariaLabel="Search jobs"
            />
          </div>
          {levels.length > 0 ? (
            <div className="flex flex-col gap-8" data-testid="agent-job-ladder">
              {levels.map(({ level, title, description, number, jobs }) => (
                <section key={level} className="flex flex-col gap-2" aria-labelledby={`agent-job-level-${level}`}>
                  <div className="flex items-baseline gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-brand-subtle text-xs font-medium text-brand">
                      {number}
                    </span>
                    <Heading id={`agent-job-level-${level}`} level={3}>
                      {title}
                    </Heading>
                    <span className="text-xs text-neutral-subtle">{description}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {jobs.map((job) => (
                      <JobCard key={job.slug} job={job} onViewDetails={openDetails} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[186px] flex-col items-center justify-center gap-1 rounded border border-neutral bg-surface-neutral px-3 py-6 text-center">
              <Icon iconName="wave-pulse" className="text-neutral-subtle" />
              <p className="mt-1 text-xs font-medium text-neutral-subtle">No job found</p>
            </div>
          )}
        </Section>

        <Section aria-labelledby="run-agents-on-qovery" className="gap-2">
          <div className="flex flex-col gap-0.5">
            <Heading level={2} id="run-agents-on-qovery">
              Run agents on Qovery
            </Heading>
            <p className="text-sm text-neutral-subtle">
              Agent Tasks run an agent next to your services, on a schedule or on an event. Create one from an
              environment’s Automations tab.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {agentTasks.map((task) => (
              <div key={task.id} className={CARD_CLASS_NAME}>
                <span className="flex h-9 w-9 items-center justify-center">
                  {task.logoPath ? (
                    <img src={task.logoPath} alt="" className="h-6 w-6 object-contain" />
                  ) : (
                    <Icon iconName={task.iconName ?? 'robot'} iconStyle="regular" className="text-xl text-brand" />
                  )}
                </span>
                <span className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-neutral">{task.title}</span>
                  <span className="line-clamp-2 text-xs leading-5 text-neutral-subtle">{task.description}</span>
                </span>
                {task.docLink && (
                  <ExternalLink href={task.docLink} size="xs" className="mt-auto">
                    Documentation
                  </ExternalLink>
                )}
              </div>
            ))}
          </div>
          <p className="flex items-center gap-2 pt-1 text-sm text-neutral" data-testid="policy-token-skill-line">
            <Icon iconName="sparkles" iconStyle="regular" className="text-brand" aria-hidden="true" />
            {POLICY_TOKEN_SKILL_LINE}
          </p>
        </Section>
      </div>
      <JobDetailsPanel
        job={selectedJob}
        open={isDetailsOpen}
        canManage={canManage}
        organizationId={organizationId}
        onOpenChange={setIsDetailsOpen}
        onExitComplete={() => setSelectedJob(null)}
      />
    </Section>
  )
}
