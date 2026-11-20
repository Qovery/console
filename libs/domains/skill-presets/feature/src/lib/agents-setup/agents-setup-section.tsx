import { useParams } from '@tanstack/react-router'
import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { Button, Heading, Icon, Link, ProgressBar, Section, useModal } from '@qovery/shared/ui'
import { useLocalStorage } from '@qovery/shared/util-hooks'
import { ConnectAgentModal } from '../agent-experience/connect-agent-modal'
import { TURN_ON_AI_LABEL, TurnOnAiModal } from '../ai-features-notice/ai-features-notice'
import { useAgentActivity } from '../hooks/use-agent-activity/use-agent-activity'
import { useAgentExperiencePolicyTokens } from '../hooks/use-agent-experience-policy-tokens/use-agent-experience-policy-tokens'
import { useAiFeaturesEnabled } from '../hooks/use-ai-features-enabled/use-ai-features-enabled'
import { useCanManageSkillPresets } from '../hooks/use-can-manage-skill-presets/use-can-manage-skill-presets'
import { useSkillPresets } from '../hooks/use-skill-presets/use-skill-presets'
import { type AgentExperienceStepId, computeAgentExperienceSetup } from '../utils/agent-experience'

const DAY_MS = 24 * 3_600_000

export const AGENTS_SETUP_DISMISSED_KEY = 'agents-setup-dismissed'

const STEPS: Record<AgentExperienceStepId, { title: string; description: string; done: string; action: string }> = {
  preset: {
    title: 'Create a preset in the Skills registry',
    description: 'Start from a template for your team’s profile: which Qovery skills agents load, and your rules.',
    done: 'A preset is set up. Agents that load the Qovery skills get it.',
    action: 'Create a preset',
  },
  'policy-token': {
    title: 'Limit what agents can do',
    description: 'Create a policy token, so an agent can only do what its policy allows.',
    done: 'A policy token is set up.',
    action: 'Create a policy token',
  },
  connect: {
    title: 'Connect your agent',
    description: 'Install the Qovery skills where your team codes.',
    // What we know, not what we assume: no activity does not mean no agent is installed.
    done: 'We’ve seen agent activity in the last 30 days.',
    action: 'Connect an agent',
  },
}

/** The last 30 days, ending now (rounded to the minute, so the query key is stable). */
function useLastMonth() {
  const [to] = useState(() => new Date(Math.ceil(Date.now() / 60_000) * 60_000))
  return useMemo(
    () => ({ from: new Date(to.getTime() - 30 * DAY_MS).toISOString(), to: to.toISOString(), bucket: 'DAY' as const }),
    [to]
  )
}

function StepAction({ step, organizationId }: { step: AgentExperienceStepId; organizationId: string }) {
  const { openModal, closeModal } = useModal()
  if (step === 'connect') {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        color="neutral"
        onClick={() => openModal({ content: <ConnectAgentModal onClose={closeModal} />, options: { width: 676 } })}
      >
        {STEPS[step].action}
      </Button>
    )
  }
  return (
    <Link
      as="button"
      to={
        step === 'preset'
          ? '/organization/$organizationId/agent-experience/skill-presets/new'
          : '/organization/$organizationId/agent-experience/policy-tokens'
      }
      params={{ organizationId }}
      size="sm"
      variant="outline"
      color="neutral"
    >
      {STEPS[step].action}
    </Link>
  )
}

/**
 * Agents setup on the organization overview, in the style of its onboarding checklist: create a
 * preset, limit what agents can do, connect your agent. Owners and admins only, until every step is
 * done or they dismiss it. "Connected" is what we can see: agent activity in the last 30 days.
 */
export function AgentsSetupSection() {
  const { organizationId = '' } = useParams({ strict: false })
  const { canManage, isLoading: isRoleLoading } = useCanManageSkillPresets({ organizationId })
  const [dismissed, setDismissed] = useLocalStorage(`${AGENTS_SETUP_DISMISSED_KEY}_${organizationId}`, false)
  const enabled = canManage && !dismissed
  const range = useLastMonth()
  const activity = useAgentActivity({ organizationId, scope: 'organization', enabled, ...range })
  const presets = useSkillPresets({ organizationId, isTemplate: false, enabled })
  const tokens = useAgentExperiencePolicyTokens({ organizationId, enabled })
  const aiFeaturesEnabled = useAiFeaturesEnabled({ organizationId })
  const { openModal, closeModal } = useModal()

  if (isRoleLoading || !enabled) return null
  // Quiet when the data is not there (loading, or the endpoints are not available): a setup card that
  // guesses would claim more than we know.
  if (!activity.data || !presets.data || !tokens.data) return null

  const setup = computeAgentExperienceSetup({
    skillLoads: activity.data.totals.skill_loads,
    actions: activity.data.totals.actions,
    denials: activity.data.totals.denials,
    presets: presets.data.length,
    policyTokens: tokens.data.length,
  })
  if (setup.nextStep === null) return null
  const percent = Math.round((setup.doneCount / setup.steps.length) * 100)

  return (
    <Section aria-labelledby="agents-setup" className="flex flex-col gap-3" data-testid="agents-setup">
      <div className="flex items-center justify-between">
        <Heading level={2} id="agents-setup">
          Set up your coding agents
        </Heading>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="flex h-6 w-6 items-center justify-center rounded text-neutral-subtle transition-colors hover:bg-surface-neutral-subtle hover:text-neutral focus:outline-none"
          aria-label="Dismiss agents setup"
        >
          <Icon iconName="xmark" className="text-ssm" />
        </button>
      </div>
      <div className="overflow-hidden rounded-lg border border-neutral bg-surface-neutral">
        <div className="flex h-12 items-center gap-4 border-b border-neutral bg-surface-neutral-subtle px-4 py-3">
          <span className="shrink-0 font-code text-xs uppercase text-neutral">Finish your setup</span>
          <div className="flex-1">
            <ProgressBar.Root aria-hidden="true">
              <ProgressBar.Cell value={percent} color="var(--green-9)" />
            </ProgressBar.Root>
          </div>
          <span
            className="shrink-0 font-code text-xs tabular-nums text-neutral-subtle"
            data-testid="agents-setup-progress"
          >
            {setup.doneCount} of {setup.steps.length} done
          </span>
        </div>
        {!aiFeaturesEnabled && (
          <div
            className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral px-4 py-3 text-sm"
            data-testid="agents-setup-ai-off"
          >
            <span className="text-neutral-subtle">AI features are off: presets need them.</span>
            <Button
              type="button"
              size="sm"
              onClick={() =>
                openModal({ content: <TurnOnAiModal organizationId={organizationId} onClose={closeModal} /> })
              }
            >
              {TURN_ON_AI_LABEL}
            </Button>
          </div>
        )}
        <ol className="divide-y divide-neutral" data-testid="agents-setup-steps">
          {setup.steps.map(({ id, done }) => {
            const step = STEPS[id]
            return (
              <li
                key={id}
                data-testid={`agents-setup-step-${id}`}
                data-state={done ? 'done' : id === setup.nextStep ? 'next' : 'todo'}
                className="flex flex-wrap items-center justify-between gap-4 px-4 py-3"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span
                    className={clsx('text-sm font-medium', done ? 'text-neutral-subtle line-through' : 'text-neutral')}
                  >
                    {step.title}
                    {done && <span className="sr-only"> (done)</span>}
                  </span>
                  <span className="text-xs text-neutral-subtle">{done ? step.done : step.description}</span>
                </div>
                {done ? (
                  <Icon iconName="circle-check" className="text-sm text-positive" aria-hidden="true" />
                ) : (
                  <StepAction step={id} organizationId={organizationId} />
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </Section>
  )
}
