import { useParams } from '@tanstack/react-router'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { CopyButton, ExternalLink, Heading, Icon, InputTextArea, Link, ModalCrud } from '@qovery/shared/ui'
import { useCopyToClipboard } from '@qovery/shared/util-hooks'
import { CodingAgentLogos } from './ui/agent-experience-ui'

export const NEW_JOB_TITLE = 'Automate a new job'

/** Recurring jobs a platform team would type. Clicking one fills the field. */
export const NEW_JOB_EXAMPLES = [
  'Every weeknight at 8 PM, stop dev and QA environments nobody used today',
  'Every Monday, set CPU and memory of my production apps from last week’s usage, within limits',
  'Every hour, delete preview environments whose pull request is merged',
]

/** The slash command the qovery-policy-token skill answers to, with the intent on one line. */
export const policyTokenCommand = (intent: string) =>
  `/qovery-policy-token ${intent.replace(/\s+/g, ' ').trim() || '<describe the job>'}`

// What the skill does, in its own order (qovery-skills, qovery-policy-token/SKILL.md).
const NEXT_STEPS = [
  'It asks what the agent needs, finds the projects, environments and services you mean, and confirms them with you.',
  'It writes an Open Policy Agent (Rego) policy that refuses everything by default and allows only that job, and explains each rule.',
  'It tests the policy locally: allowed calls must pass, everything else must be refused, until every case is green.',
  'Once you approve the policy, it creates the token and checks it live: refused calls are rejected before they run, safe reads work. It never runs a destructive action unless you say so.',
]

/**
 * Describe a job in plain English; the modal turns it into a command for the coding agent, which the
 * qovery-policy-token skill turns into a tested policy token. Nothing is created from the Console.
 */
export function NewJobModal({ onClose, canManage }: { onClose: () => void; canManage: boolean }) {
  const { organizationId = '' } = useParams({ strict: false })
  const methods = useForm()
  const [intent, setIntent] = useState('')
  const [, copy] = useCopyToClipboard()
  const [copied, setCopied] = useState(false)
  const command = policyTokenCommand(intent)
  const hasIntent = intent.trim().length > 0

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title={NEW_JOB_TITLE}
        description="Describe the job in plain English. Your coding agent writes the policy, tests it, and creates the token."
        submitLabel={copied ? 'Copied' : 'Copy command'}
        submitDisabled={!hasIntent}
        onClose={onClose}
        onSubmit={methods.handleSubmit(() => {
          copy(command)
          setCopied(true)
          window.setTimeout(() => setCopied(false), 2000)
        })}
        bottomButtons={
          <ExternalLink
            href="https://www.qovery.com/docs/configuration/organization/api-policy-token"
            as="button"
            variant="plain"
            color="neutral"
            size="lg"
            className="mr-auto"
          >
            Read the docs
          </ExternalLink>
        }
      >
        <div className="flex flex-col gap-5" data-testid="new-job-modal">
          <div className="flex flex-col gap-2">
            <InputTextArea
              label="The job"
              name="intent"
              value={intent}
              onChange={(event) => {
                setIntent(event.currentTarget.value)
                setCopied(false)
              }}
              dataTestId="new-job-intent"
            />
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-neutral-subtle">Try:</span>
              {NEW_JOB_EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  className="rounded border border-neutral px-2 py-1 text-left text-neutral hover:bg-surface-neutral-subtle"
                  onClick={() => {
                    setIntent(example)
                    setCopied(false)
                  }}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Heading level={3} className="text-sm">
              Command for your coding agent
            </Heading>
            <div className="flex items-start gap-3 rounded border border-neutral bg-surface-neutral-subtle p-3">
              <code
                className={`min-w-0 flex-1 whitespace-pre-wrap break-words font-code text-sm ${hasIntent ? 'text-neutral' : 'text-neutral-subtle'}`}
                data-testid="new-job-command"
              >
                {command}
              </code>
              {hasIntent && <CopyButton content={command} />}
            </div>
            <CodingAgentLogos />
            <p className="text-xs text-neutral-subtle">
              Works in these coding agents and any agent with the Qovery skills. Where slash commands are not available,
              ask your agent to use the qovery-policy-token skill with the same words. Skills not installed yet?{' '}
              <Link
                to="/organization/$organizationId/agent-experience/connect"
                params={{ organizationId }}
                color="brand"
                size="xs"
                onClick={onClose}
              >
                Connect your agent
              </Link>
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Heading level={3} className="text-sm">
              What happens next
            </Heading>
            <ol className="flex flex-col gap-2 text-sm text-neutral">
              {NEXT_STEPS.map((text, index) => (
                <li key={text} className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-brand-subtle text-xs font-medium text-brand">
                    {index + 1}
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ol>
            <p className="text-sm text-neutral" data-testid="new-job-schedule">
              Then schedule it: as an Agent Task on Qovery (recommended), or from your coding agent, with that token.
            </p>
            <p className="text-xs text-neutral-subtle">
              A policy cannot be edited after the token is created: to change it, the skill creates a new token. Every
              call the token makes shows in Activity.
            </p>
            {!canManage && (
              <p className="flex items-start gap-1.5 text-xs text-neutral" data-testid="new-job-member-note">
                <Icon iconName="circle-info" iconStyle="regular" className="mt-0.5 text-neutral-subtle" />
                Creating the token needs an organization owner or admin. Send them the command, or run it with one of
                them.
              </p>
            )}
          </div>
        </div>
      </ModalCrud>
    </FormProvider>
  )
}
