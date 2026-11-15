import { useParams } from '@tanstack/react-router'
import { useState } from 'react'
import { PolicyApiTokenCrudModal } from '@qovery/domains/organizations/feature'
import { AGENTIC_WORKFLOW_TEMPLATES } from '@qovery/domains/services/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Button, ExternalLink, Heading, Icon, Section, useModal } from '@qovery/shared/ui'
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

export const POLICY_TOKEN_SKILL_LINE =
  'Describe the job in plain English, and the qovery-policy-token skill writes and tests the policy.'

function CopyPromptButton({ prompt, title }: { prompt: string; title: string }) {
  const [, copy] = useCopyToClipboard()
  const [copied, setCopied] = useState(false)
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      color="neutral"
      className="gap-1.5"
      aria-label={`Copy the prompt for ${title}`}
      onClick={() => {
        copy(prompt)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 2000)
      }}
    >
      <Icon iconName={copied ? 'check' : 'copy'} iconStyle="regular" />
      {copied ? 'Copied' : 'Copy prompt'}
    </Button>
  )
}

function JobCard({ job, canManage, organizationId }: { job: AgentJob; canManage: boolean; organizationId: string }) {
  const { openModal, closeModal } = useModal()
  return (
    <li
      className="flex flex-col gap-3 rounded-md border border-neutral p-4"
      data-testid={`agent-job-${job.slug}`}
      aria-labelledby={`agent-job-${job.slug}-title`}
    >
      <div className="flex flex-col gap-1">
        <Heading level={3} id={`agent-job-${job.slug}-title`} className="text-sm">
          {job.title}
        </Heading>
        <p className="text-sm text-neutral-subtle">{job.does}</p>
      </div>
      <div className="flex flex-col gap-1 text-xs">
        <span className="font-medium text-neutral">It can never</span>
        <ul className="flex flex-col gap-1 text-neutral-subtle">
          {job.cannot.map((line) => (
            <li key={line} className="flex items-start gap-1.5">
              <Icon iconName="ban" iconStyle="regular" className="mt-0.5 text-negative" aria-hidden="true" />
              {line}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-auto flex flex-wrap items-center gap-2">
        {canManage && (
          <Button
            type="button"
            size="sm"
            className="gap-1.5"
            onClick={() =>
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
          >
            <Icon iconName="key" iconStyle="regular" />
            Create policy token
          </Button>
        )}
        <CopyPromptButton prompt={job.prompt} title={job.title} />
        <ExternalLink href={policyExampleUrl(job.slug)} size="sm">
          Read the example
        </ExternalLink>
      </div>
    </li>
  )
}

/**
 * Jobs agents can run on their own, safest first, from the docs' policy examples. Each comes with a
 * policy token that allows exactly what the job needs. Members see the catalog without the create action.
 */
export function AgentExperienceAutomate() {
  const { organizationId = '' } = useParams({ strict: false })
  const { canManage } = useCanManageSkillPresets({ organizationId })
  const agentTasks = AGENT_TASK_IDS.flatMap((id) => AGENTIC_WORKFLOW_TEMPLATES.filter((item) => item.id === id))
  useDocumentTitle('Automate - Agent Experience')

  return (
    <Section className="px-8 pb-8 pt-6">
      <SettingsHeading
        title="Automate"
        description="Jobs agents can run on their own, safest first. Each comes with a policy token that allows exactly what the job needs. Anything else is refused at the API, and every call is logged."
      />
      <div className="flex flex-col gap-8">
        <MockScenarioBanner />
        <ol className="flex flex-col gap-8" data-testid="agent-job-ladder">
          {AGENT_JOB_LEVELS.map(({ level, title, description }, index) => (
            <li key={level}>
              <Section aria-labelledby={`agent-job-level-${level}`} className="flex flex-col gap-3">
                <div className="flex items-baseline gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-brand-subtle text-xs font-medium text-brand">
                    {index + 1}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <Heading level={2} id={`agent-job-level-${level}`}>
                      {title}
                    </Heading>
                    <p className="text-sm text-neutral-subtle">{description}</p>
                  </div>
                </div>
                <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {AGENT_JOBS.filter((job) => job.level === level).map((job) => (
                    <JobCard key={job.slug} job={job} canManage={canManage} organizationId={organizationId} />
                  ))}
                </ul>
              </Section>
            </li>
          ))}
        </ol>

        <Section
          aria-labelledby="run-agents-on-qovery"
          className="flex flex-col gap-3 rounded-md bg-surface-neutral-subtle p-4"
        >
          <div className="flex flex-col gap-0.5">
            <Heading level={2} id="run-agents-on-qovery">
              Run agents on Qovery
            </Heading>
            <p className="text-sm text-neutral-subtle">
              Agent Tasks run an agent next to your services, on a schedule or on an event. Create one from an
              environment’s Automations tab.
            </p>
          </div>
          <ul className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
            {agentTasks.map((task) => (
              <li key={task.id} className="flex flex-col gap-1 rounded-md border border-neutral bg-surface-neutral p-3">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-neutral">
                  {task.logoPath ? (
                    <img src={task.logoPath} alt="" className="h-4 w-4 object-contain" />
                  ) : (
                    <Icon iconName={task.iconName ?? 'robot'} iconStyle="regular" className="text-brand" />
                  )}
                  {task.title}
                </span>
                <span className="text-xs text-neutral-subtle">{task.description}</span>
                {task.docLink && (
                  <ExternalLink href={task.docLink} size="xs" className="mt-1">
                    Documentation
                  </ExternalLink>
                )}
              </li>
            ))}
          </ul>
          <p className="flex items-center gap-2 text-sm text-neutral" data-testid="policy-token-skill-line">
            <Icon iconName="sparkles" iconStyle="regular" className="text-brand" aria-hidden="true" />
            {POLICY_TOKEN_SKILL_LINE}
          </p>
        </Section>
      </div>
    </Section>
  )
}
