import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Accordion, Button, ExternalLink, Heading, InputTextArea, ModalCrud, useModal } from '@qovery/shared/ui'
import { useCopyToClipboard } from '@qovery/shared/util-hooks'
import { ConnectAgentModal } from './connect-agent-modal'
import { CodingAgentLogos } from './ui/agent-experience-ui'

/** The button that opens the modal. */
export const NEW_JOB_LABEL = 'Automate a new job'
/** The modal prepares a command; it neither creates the token nor schedules the job. */
export const NEW_JOB_TITLE = 'Prepare a command for your agent'

/** Recurring jobs a platform team would type. Clicking one fills the empty field. */
export const NEW_JOB_EXAMPLES = [
  'Every weeknight at 8 PM, stop dev and QA environments nobody used today',
  'Every Monday, set CPU and memory of my production apps from last week’s usage, within limits',
  'Every hour, delete preview environments whose pull request is merged',
]

/** The slash command the qovery-policy-token skill answers to, with the intent on one line. */
export const policyTokenCommand = (intent: string) =>
  `/qovery-policy-token ${intent.replace(/\s+/g, ' ').trim() || '<describe the job>'}`

// What the skill does, in its own order (qovery-skills, qovery-policy-token/SKILL.md).
const AGENT_STEPS = [
  'It asks what the agent needs, finds the projects, environments and services you mean, and confirms them with you.',
  'It writes an Open Policy Agent (Rego) policy that refuses everything by default and allows only that job, and explains each rule.',
  'It tests the policy locally: allowed calls must pass, everything else must be refused, until every case is green.',
  'Once you approve the policy, it creates the token and checks it live: refused calls are rejected before they run, safe reads work. It never runs a destructive action unless you say so.',
]

const POLICY_TOKEN_DOCS_URL = 'https://www.qovery.com/docs/configuration/organization/api-policy-token'

/**
 * Describe a job in plain English; the modal turns it into a command for the coding agent, which the
 * qovery-policy-token skill turns into a tested policy token. Scheduling the job is a separate step,
 * after the token exists. Nothing is created from the Console. Owners and admins only.
 */
export function NewJobModal({ onClose }: { onClose: () => void }) {
  const { openModal, closeModal } = useModal()
  const methods = useForm()
  const [intent, setIntent] = useState('')
  const [, copy] = useCopyToClipboard()
  const [copied, setCopied] = useState(false)
  const command = policyTokenCommand(intent)
  const hasIntent = intent.trim().length > 0

  const updateIntent = (value: string) => {
    setIntent(value)
    setCopied(false)
  }

  return (
    <FormProvider {...methods}>
      <ModalCrud
        title={NEW_JOB_TITLE}
        description={
          <>
            Describe the job. You get a command to run in your coding agent, which writes the policy, tests it, and
            creates the policy token.{' '}
            <ExternalLink href={POLICY_TOKEN_DOCS_URL} size="sm">
              Docs
            </ExternalLink>
          </>
        }
        submitLabel={copied ? 'Copied' : 'Copy command'}
        submitDisabled={!hasIntent}
        onClose={onClose}
        onSubmit={methods.handleSubmit(() => {
          copy(command)
          setCopied(true)
          window.setTimeout(() => setCopied(false), 2000)
        })}
      >
        <div className="flex flex-col gap-4" data-testid="new-job-modal">
          <InputTextArea
            label="The job"
            name="intent"
            value={intent}
            onChange={(event) => updateIntent(event.currentTarget.value)}
            dataTestId="new-job-intent"
            hint={
              <>
                Say what the agent does, on which environments, and when.
                {/* Examples only fill an empty field, so they never replace what you typed. */}
                {!hasIntent && (
                  <span className="mt-2 flex flex-col items-start gap-1.5" data-testid="new-job-examples">
                    <span>Or click an example to fill the field:</span>
                    {NEW_JOB_EXAMPLES.map((example) => (
                      <Button
                        key={example}
                        type="button"
                        variant="outline"
                        color="neutral"
                        size="xs"
                        className="h-auto whitespace-normal py-1 text-left font-normal"
                        onClick={() => updateIntent(example)}
                      >
                        {example}
                      </Button>
                    ))}
                  </span>
                )}
              </>
            }
          />

          <div className="flex flex-col gap-2">
            <Heading level={3} className="text-sm">
              1. Run this command in your coding agent
            </Heading>
            <div className="flex items-start gap-3 rounded border border-neutral bg-surface-neutral-subtle p-3">
              <code
                className={`min-w-0 flex-1 whitespace-pre-wrap break-words font-code text-sm ${hasIntent ? 'text-neutral' : 'text-neutral-subtle'}`}
                data-testid="new-job-command"
              >
                {command}
              </code>
            </div>
            <CodingAgentLogos />
            <p className="text-xs text-neutral-subtle">
              Works in these coding agents and any agent with the Qovery skills. Where slash commands are not available,
              ask your agent to use the qovery-policy-token skill with the same words. Skills not installed yet?{' '}
              <Button
                type="button"
                variant="plain"
                color="brand"
                size="xs"
                className="h-auto px-0 text-xs"
                onClick={() =>
                  openModal({ content: <ConnectAgentModal onClose={closeModal} />, options: { width: 676 } })
                }
              >
                Connect your agent
              </Button>
            </p>
            <Accordion.Root type="single" collapsible className="rounded border border-neutral">
              <Accordion.Item value="agent-steps">
                <Accordion.Trigger className="min-h-9 w-full gap-2 px-3 text-sm font-medium text-neutral">
                  What your agent does with it
                </Accordion.Trigger>
                <Accordion.Content className="flex flex-col gap-2 px-3 pb-3">
                  <ol className="flex flex-col gap-1.5 text-sm text-neutral">
                    {AGENT_STEPS.map((text, index) => (
                      <li key={text} className="flex items-start gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-brand-subtle text-xs font-medium text-brand">
                          {index + 1}
                        </span>
                        <span>{text}</span>
                      </li>
                    ))}
                  </ol>
                  <p className="text-xs text-neutral-subtle">
                    A policy cannot be edited after the token is created: to change it, the skill creates a new token.
                    Every call the token makes shows in Activity.
                  </p>
                </Accordion.Content>
              </Accordion.Item>
            </Accordion.Root>
          </div>

          <div className="flex flex-col gap-1">
            <Heading level={3} className="text-sm">
              2. Schedule the job
            </Heading>
            <p className="text-sm text-neutral-subtle" data-testid="new-job-schedule">
              A separate step, once the token exists: schedule the job as an Agent Task on Qovery (recommended), or from
              your coding agent, with that token.
            </p>
          </div>
        </div>
      </ModalCrud>
    </FormProvider>
  )
}
