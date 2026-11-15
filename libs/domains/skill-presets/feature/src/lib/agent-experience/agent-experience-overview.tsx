import { useNavigate, useParams } from '@tanstack/react-router'
import clsx from 'clsx'
import { type ReactNode, useMemo, useState } from 'react'
import { type AgentActivityResponse } from '@qovery/domains/skill-presets/data-access'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Badge, Button, Heading, Icon, Link, ProgressBar, Section, Skeleton, useModal } from '@qovery/shared/ui'
import { timeAgo } from '@qovery/shared/util-dates'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { HintLine } from '../agent-activity/agent-activity'
import { TURN_ON_AI_LABEL, TurnOnAiModal } from '../ai-features-notice/ai-features-notice'
import { useAgentActivity } from '../hooks/use-agent-activity/use-agent-activity'
import { useAgentExperiencePolicyTokens } from '../hooks/use-agent-experience-policy-tokens/use-agent-experience-policy-tokens'
import { useAiFeaturesEnabled } from '../hooks/use-ai-features-enabled/use-ai-features-enabled'
import { useCanManageSkillPresets } from '../hooks/use-can-manage-skill-presets/use-can-manage-skill-presets'
import { useCopilotStatus } from '../hooks/use-copilot-status/use-copilot-status'
import { useSkillPresetAssignees } from '../hooks/use-skill-preset-assignees/use-skill-preset-assignees'
import { useSkillPresets } from '../hooks/use-skill-presets/use-skill-presets'
import { LoadError } from '../load-error/load-error'
import { MockScenarioBanner } from '../mock-scenario-banner/mock-scenario-banner'
import { AssignmentChips } from '../settings-skill-presets/assignment-chips'
import { actionLabel, actorLabel, computeAgentActivityHints, targetLabel } from '../utils/agent-activity'
import {
  type AgentExperienceSetup,
  type AgentExperienceStepId,
  computeAgentExperienceSetup,
} from '../utils/agent-experience'
import { AGENT_JOBS } from '../utils/agent-jobs'
import { OnOffBadge, copilotStateLabel } from './agent-experience-copilot'
import { PresetSummary } from './preset-summary'

const DAY_MS = 24 * 3_600_000

/** A range ending now (rounded to the minute, so the query key is stable), with daily buckets. */
function useRange(days: number) {
  const [to] = useState(() => new Date(Math.ceil(Date.now() / 60_000) * 60_000))
  return useMemo(
    () => ({
      from: new Date(to.getTime() - days * DAY_MS).toISOString(),
      to: to.toISOString(),
      bucket: 'DAY' as const,
    }),
    [to, days]
  )
}

const STEPS: Record<AgentExperienceStepId, { title: string; description: string; done: string; action: string }> = {
  ai: {
    title: 'Turn on AI',
    description: 'AI features and the Copilot, in one step. The Copilot starts read-only.',
    done: 'AI features and the Copilot are on.',
    action: TURN_ON_AI_LABEL,
  },
  connect: {
    title: 'Connect an agent',
    description: 'Install the Qovery skills, the CLI or the MCP server where your team codes.',
    done: 'Agents loaded skills or acted on Qovery in the last 30 days.',
    action: 'Connect your agent',
  },
  preset: {
    title: 'Choose how agents behave',
    description: 'Create a preset, or start from a template: which skills agents load, and your team’s rules.',
    done: 'A preset is set up.',
    action: 'Create a preset',
  },
  'policy-token': {
    title: 'Limit what agents can do',
    description: 'Create a policy token, so an agent can only do what its policy allows.',
    done: 'A policy token is set up.',
    action: 'Create a policy token',
  },
  activity: {
    title: 'Watch what agents do',
    description: 'See what agents did on Qovery, and what was blocked.',
    done: 'Agents acted on Qovery in the last 30 days.',
    action: 'Open agent activity',
  },
}

type AgentExperiencePath =
  | '/organization/$organizationId/agent-experience/connect'
  | '/organization/$organizationId/agent-experience/skill-presets'
  | '/organization/$organizationId/agent-experience/policy-tokens'
  | '/organization/$organizationId/agent-experience/agent-activity'
  | '/organization/$organizationId/agent-experience/copilot'

const COPILOT_PATH: AgentExperiencePath = '/organization/$organizationId/agent-experience/copilot'

const STEP_PATHS: Record<Exclude<AgentExperienceStepId, 'ai'>, AgentExperiencePath> = {
  connect: '/organization/$organizationId/agent-experience/connect',
  preset: '/organization/$organizationId/agent-experience/skill-presets',
  'policy-token': '/organization/$organizationId/agent-experience/policy-tokens',
  activity: '/organization/$organizationId/agent-experience/agent-activity',
}

type HeroPath =
  | AgentExperiencePath
  | '/organization/$organizationId/agent-experience/automate'
  | '/organization/$organizationId/audit-logs'

const PILLARS: {
  id: string
  icon: 'compass' | 'shield-check' | 'binoculars'
  title: string
  text: string
  pieces: {
    icon: 'message-bot' | 'sparkles' | 'sliders' | 'key' | 'stairs' | 'wave-pulse' | 'lock-keyhole'
    name: string
    to: HeroPath
  }[]
}[] = [
  {
    id: 'guide',
    icon: 'compass',
    title: 'Guide',
    text: 'The Copilot and skills, tailored per team and per person with skill presets.',
    pieces: [
      { icon: 'message-bot', name: 'Copilot', to: COPILOT_PATH },
      { icon: 'sparkles', name: 'Skills', to: STEP_PATHS.connect },
      { icon: 'sliders', name: 'Skill presets', to: STEP_PATHS.preset },
    ],
  },
  {
    id: 'control',
    icon: 'shield-check',
    title: 'Control',
    text: 'Each agent gets exactly the permissions its job needs, checked on every API call. Deny by default.',
    pieces: [
      { icon: 'key', name: 'Policy tokens', to: STEP_PATHS['policy-token'] },
      { icon: 'stairs', name: 'Automate', to: '/organization/$organizationId/agent-experience/automate' },
    ],
  },
  {
    id: 'observe',
    icon: 'binoculars',
    title: 'Observe',
    text: 'What agents did, and what was blocked.',
    pieces: [
      { icon: 'wave-pulse', name: 'Agent activity', to: STEP_PATHS.activity },
      { icon: 'lock-keyhole', name: 'Audit logs', to: '/organization/$organizationId/audit-logs' },
    ],
  },
]

export const HERO_TITLE = 'The future of infrastructure is agentic'
export const HERO_SUBTITLE =
  'Agents can do real infrastructure work on their own when every operation is checked at the API. Set that up here.'

/**
 * The story of Agent Experience, on every Overview. Full the first times, with one action; compact
 * once it is in use, so the numbers stay on top.
 */
function AgentExperienceHero({
  organizationId,
  compact,
  action,
}: {
  organizationId: string
  compact: boolean
  action?: AgentExperienceStepId
}) {
  if (compact) {
    return (
      <Section
        aria-labelledby="agent-experience-hero"
        className="flex flex-col gap-2 rounded-md border border-neutral bg-surface-neutral-subtle px-4 py-3"
        data-testid="agent-experience-hero"
        data-compact="true"
      >
        <p className="text-sm text-neutral">
          <Heading level={2} id="agent-experience-hero" className="inline text-sm">
            {HERO_TITLE}.
          </Heading>{' '}
          <span className="text-neutral-subtle">{HERO_SUBTITLE}</span>
        </p>
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          {PILLARS.map((pillar) => (
            <li key={pillar.id} className="inline-flex items-center gap-1.5">
              <Icon iconName={pillar.icon} iconStyle="regular" className="text-brand" aria-hidden="true" />
              <span className="font-medium text-neutral">{pillar.title}:</span>
              {pillar.pieces.map((piece, index) => (
                <span key={piece.name}>
                  <Link to={piece.to} params={{ organizationId }} color="brand" size="xs">
                    {piece.name}
                  </Link>
                  {index < pillar.pieces.length - 1 ? ',' : ''}
                </span>
              ))}
            </li>
          ))}
        </ul>
      </Section>
    )
  }
  return (
    <Section
      aria-labelledby="agent-experience-hero"
      className="flex flex-col gap-4 rounded-md border border-neutral bg-surface-neutral-subtle p-5"
      data-testid="agent-experience-hero"
    >
      <div className="flex flex-col gap-1">
        <Heading level={2} id="agent-experience-hero" className="text-xl">
          {HERO_TITLE}
        </Heading>
        <p className="max-w-3xl text-sm text-neutral-subtle">{HERO_SUBTITLE}</p>
      </div>
      <ul className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {PILLARS.map((pillar) => (
          <li
            key={pillar.id}
            className="flex flex-col gap-2 rounded-md border border-neutral bg-surface-neutral p-4"
            data-testid={`hero-pillar-${pillar.id}`}
          >
            <span className="inline-flex items-center gap-2 text-sm font-medium text-neutral">
              <Icon iconName={pillar.icon} iconStyle="regular" className="text-brand" aria-hidden="true" />
              {pillar.title}
            </span>
            <span className="text-xs text-neutral-subtle">{pillar.text}</span>
            <span className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-1">
              {pillar.pieces.map((piece) => (
                <Link
                  key={piece.name}
                  to={piece.to}
                  params={{ organizationId }}
                  color="brand"
                  size="xs"
                  className="inline-flex items-center gap-1"
                >
                  <Icon iconName={piece.icon} iconStyle="regular" aria-hidden="true" />
                  {piece.name}
                </Link>
              ))}
            </span>
          </li>
        ))}
      </ul>
      {action && (
        <div className="flex flex-wrap items-center gap-3">
          <StepAction step={action} primary organizationId={organizationId} />
        </div>
      )}
    </Section>
  )
}

function StepAction({
  step,
  primary,
  organizationId,
}: {
  step: AgentExperienceStepId
  primary: boolean
  organizationId: string
}) {
  const { openModal, closeModal } = useModal()
  const variant = primary ? 'solid' : 'outline'
  const color = primary ? 'brand' : 'neutral'
  if (step === 'ai') {
    return (
      <Button
        type="button"
        size="md"
        variant={variant}
        color={color}
        onClick={() => openModal({ content: <TurnOnAiModal organizationId={organizationId} onClose={closeModal} /> })}
      >
        {STEPS[step].action}
      </Button>
    )
  }
  return (
    <Link as="button" to={STEP_PATHS[step]} params={{ organizationId }} size="md" variant={variant} color={color}>
      {STEPS[step].action}
    </Link>
  )
}

/**
 * `actionAbove`: the step whose action the intro already shows. It gets a status here instead of a
 * second identical button.
 */
function SetupChecklist({
  setup,
  organizationId,
  actionAbove,
}: {
  setup: AgentExperienceSetup
  organizationId: string
  actionAbove?: AgentExperienceStepId
}) {
  const percent = Math.round((setup.doneCount / setup.steps.length) * 100)
  return (
    <Section aria-labelledby="setup-checklist" className="flex flex-col gap-4 rounded-md border border-neutral p-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <Heading level={2} id="setup-checklist">
            {setup.state === 'empty' ? 'Set up how coding agents work with Qovery' : 'Finish your setup'}
          </Heading>
          <span className="text-sm text-neutral-subtle" data-testid="setup-progress">
            {setup.doneCount} of {setup.steps.length} done
          </span>
        </div>
        <ProgressBar.Root aria-hidden="true">
          <ProgressBar.Cell value={percent} color="var(--brand-9)" />
        </ProgressBar.Root>
      </div>
      <ol className="flex flex-col gap-2" data-testid="setup-steps">
        {setup.steps.map(({ id, done }) => {
          const isNext = id === setup.nextStep
          const step = STEPS[id]
          return (
            <li
              key={id}
              data-testid={`setup-step-${id}`}
              data-state={done ? 'done' : isNext ? 'next' : 'todo'}
              className={clsx(
                'flex flex-wrap items-center justify-between gap-3 rounded-md border px-4 py-3',
                isNext ? 'border-brand-strong bg-surface-brand-subtle' : 'border-neutral'
              )}
            >
              <div className="flex min-w-0 items-start gap-3">
                <Icon
                  iconName={done ? 'circle-check' : 'circle'}
                  iconStyle={done ? 'solid' : 'regular'}
                  className={clsx('mt-0.5', done ? 'text-positive' : 'text-neutral-subtle')}
                  aria-hidden="true"
                />
                <div className="flex flex-col gap-0.5">
                  <span className={clsx('text-sm font-medium', done ? 'text-neutral-subtle' : 'text-neutral')}>
                    {step.title}
                    {done && <span className="sr-only"> (done)</span>}
                    {isNext && (
                      <Badge variant="surface" color="brand" size="sm" className="ml-2">
                        Next
                      </Badge>
                    )}
                  </span>
                  <span className="text-xs text-neutral-subtle">{done ? step.done : step.description}</span>
                </div>
              </div>
              {!done &&
                (id === actionAbove ? (
                  <Badge variant="outline" color="neutral" className="gap-1" data-testid={`setup-step-${id}-status`}>
                    <Icon iconName="circle" iconStyle="regular" aria-hidden="true" />
                    {id === 'ai' ? 'Off' : 'Not yet'}
                  </Badge>
                ) : (
                  <StepAction step={id} primary={isNext} organizationId={organizationId} />
                ))}
            </li>
          )
        })}
      </ol>
    </Section>
  )
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-0.5 px-4 py-3">
      <dt className="text-xs text-neutral-subtle">{label}</dt>
      <dd className="text-base font-medium tabular-nums text-neutral">{value.toLocaleString('en-US')}</dd>
    </div>
  )
}

function WeekKpis({ week, showMembers }: { week: AgentActivityResponse; showMembers: boolean }) {
  return (
    <dl
      className={clsx(
        'grid grid-cols-2 divide-x divide-neutral rounded-md border border-neutral',
        showMembers ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
      )}
      data-testid="week-kpis"
    >
      <Kpi label="Agent actions this week" value={week.totals.actions} />
      <Kpi label="Denied this week" value={week.totals.denials} />
      {showMembers && <Kpi label="Members using agents" value={week.totals.members} />}
      <Kpi label="Skill loads this week" value={week.totals.skill_loads} />
    </dl>
  )
}

function Card({
  id,
  title,
  link,
  children,
  className,
}: {
  id: string
  title: string
  link: { label: string; to: AgentExperiencePath }
  children: ReactNode
  className?: string
}) {
  const { organizationId = '' } = useParams({ strict: false })
  return (
    <Section
      aria-labelledby={id}
      className={clsx('flex flex-col gap-3 rounded-md border border-neutral p-4', className)}
    >
      <div className="flex items-center justify-between gap-3">
        <Heading level={2} id={id}>
          {title}
        </Heading>
        <Link to={link.to} params={{ organizationId }} color="brand" size="sm">
          {link.label}
        </Link>
      </div>
      {children}
    </Section>
  )
}

function DeniedList({ activity }: { activity: AgentActivityResponse }) {
  const denied = activity.recent.filter(({ outcome }) => outcome === 'DENIED').slice(0, 5)
  if (denied.length === 0) return <p className="text-sm text-neutral-subtle">Nothing was blocked this week.</p>
  return (
    <ul className="flex flex-col gap-2 text-sm" data-testid="overview-denied">
      {denied.map((action) => (
        <li key={`${action.at}-${action.user_name}-${action.target_name}`} className="flex flex-col">
          <span className="inline-flex flex-wrap items-center gap-1.5 text-neutral">
            <Icon iconName="ban" iconStyle="regular" className="text-negative" aria-hidden="true" />
            {actionLabel(action.event, action.target_type)} on {targetLabel(action.target_type)}
            <span className="font-code">{action.target_name}</span>
          </span>
          <span className="pl-5 text-xs text-neutral-subtle">
            {actorLabel(action.user_name).label}, {timeAgo(new Date(action.at))} ago
          </span>
        </li>
      ))}
    </ul>
  )
}

function AdminOverview({ organizationId }: { organizationId: string }) {
  const navigate = useNavigate()
  const month = useRange(30)
  const weekRange = useRange(7)
  const activity = useAgentActivity({ organizationId, scope: 'organization', ...month })
  const week = useAgentActivity({ organizationId, scope: 'organization', ...weekRange })
  const presets = useSkillPresets({ organizationId, isTemplate: false })
  const tokens = useAgentExperiencePolicyTokens({ organizationId })
  const { data: assignees } = useSkillPresetAssignees({ organizationId })
  const aiFeaturesEnabled = useAiFeaturesEnabled({ organizationId })
  const copilot = useCopilotStatus({ organizationId })

  const isLoading = activity.isLoading || presets.isLoading || tokens.isLoading
  const error = activity.error ?? presets.error ?? tokens.error
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading Agent Experience">
        <Skeleton height={72} className="w-full" show />
        <Skeleton height={240} className="w-full" show />
      </div>
    )
  }
  if (error || !activity.data) {
    return (
      <LoadError
        title="Agent Experience could not be loaded"
        error={error}
        onRetry={() => {
          activity.refetch()
          presets.refetch()
          tokens.refetch()
        }}
      />
    )
  }

  const activePresets = presets.data ?? []
  const policyTokens = tokens.data ?? []
  const setup = computeAgentExperienceSetup({
    skillLoads: activity.data.totals.skill_loads,
    actions: activity.data.totals.actions,
    denials: activity.data.totals.denials,
    presets: activePresets.length,
    policyTokens: policyTokens.length,
    aiFeaturesEnabled,
    copilotEnabled: copilot.enabled,
  })

  const aiOn = setup.steps.find(({ id }) => id === 'ai')?.done ?? false
  if (setup.state !== 'active') {
    return (
      <div className="flex flex-col gap-6" data-testid="agent-experience-state" data-state={setup.state}>
        <AgentExperienceHero
          organizationId={organizationId}
          compact={false}
          action={setup.state === 'empty' ? (aiOn ? 'connect' : 'ai') : undefined}
        />
        <SetupChecklist
          setup={setup}
          organizationId={organizationId}
          actionAbove={setup.state === 'empty' ? (aiOn ? 'connect' : 'ai') : undefined}
        />
        {setup.state === 'partial' && week.data && (
          <Section aria-labelledby="week-activity" className="flex flex-col gap-2">
            <Heading level={2} id="week-activity">
              What agents did this week
            </Heading>
            <WeekKpis week={week.data} showMembers />
          </Section>
        )}
      </div>
    )
  }

  const hints = computeAgentActivityHints(activity.data)
  const tokensByUse = [...policyTokens].sort((a, b) => (b.last_used_at ?? '').localeCompare(a.last_used_at ?? ''))
  return (
    <div className="flex flex-col gap-6" data-testid="agent-experience-state" data-state="active">
      <AgentExperienceHero organizationId={organizationId} compact />
      {week.data && <WeekKpis week={week.data} showMembers />}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card
          id="overview-presets"
          title="Active presets"
          link={{ label: 'Skill presets', to: '/organization/$organizationId/agent-experience/skill-presets' }}
        >
          <ul className="flex flex-col divide-y divide-neutral text-sm">
            {activePresets.slice(0, 5).map((preset) => (
              <li key={preset.id} className="flex flex-wrap items-center justify-between gap-2 py-2 first:pt-0">
                <span className="font-medium text-neutral">{preset.name}</span>
                <AssignmentChips assignedTo={preset.assigned_to} assignees={assignees} max={2} />
              </li>
            ))}
          </ul>
        </Card>
        <Card
          id="overview-tokens"
          title="Policy tokens in use"
          link={{ label: 'Policy tokens', to: '/organization/$organizationId/agent-experience/policy-tokens' }}
        >
          <ul className="flex flex-col divide-y divide-neutral text-sm">
            {tokensByUse.slice(0, 5).map((token) => (
              <li key={token.id} className="flex items-center justify-between gap-2 py-2 first:pt-0">
                <span className="inline-flex items-center gap-1.5 font-medium text-neutral">
                  <Icon iconName="key" iconStyle="regular" className="text-neutral-subtle" aria-hidden="true" />
                  {token.name}
                  <span className="font-normal capitalize text-neutral-subtle">{token.role_name}</span>
                </span>
                <span className="text-xs text-neutral-subtle">
                  {token.last_used_at ? `Used ${timeAgo(new Date(token.last_used_at))} ago` : 'Never used'}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-neutral-subtle" data-testid="next-job-to-automate">
            Next job to automate: {AGENT_JOBS.length} jobs agents can run on their own, safest first, each with a ready
            policy.{' '}
            <Link
              to="/organization/$organizationId/agent-experience/automate"
              params={{ organizationId }}
              color="brand"
              size="xs"
            >
              See what agents can do
            </Link>
          </p>
        </Card>
        <Card
          id="overview-copilot"
          title="Copilot"
          link={{ label: 'Copilot settings', to: '/organization/$organizationId/agent-experience/copilot' }}
        >
          <dl className="flex flex-col divide-y divide-neutral text-sm" data-testid="overview-copilot-state">
            <div className="flex items-center justify-between gap-2 pb-2">
              <dt className="text-neutral">Copilot</dt>
              <dd>
                {copilot.isLoading ? (
                  <Skeleton width={64} height={20} show />
                ) : (
                  <OnOffBadge on={copilot.enabled} label={copilotStateLabel(copilot.enabled, copilot.readOnly)} />
                )}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2 pt-2">
              <dt className="text-neutral">AI features</dt>
              <dd>
                <OnOffBadge on={aiFeaturesEnabled} />
              </dd>
            </div>
          </dl>
        </Card>
        <Card
          id="overview-denied-title"
          title="Latest denied actions"
          link={{ label: 'Agent activity', to: '/organization/$organizationId/agent-experience/agent-activity' }}
        >
          <DeniedList activity={week.data ?? activity.data} />
        </Card>
        <Card
          className="xl:col-span-2"
          id="overview-suggestions"
          title="Suggestions"
          link={{ label: 'Agent activity', to: '/organization/$organizationId/agent-experience/agent-activity' }}
        >
          {hints.length === 0 ? (
            <p className="text-sm text-neutral-subtle">Nothing to adjust in the last 30 days.</p>
          ) : (
            <ul className="flex flex-col gap-3 text-sm text-neutral">
              {hints.slice(0, 4).map((hint) => (
                <li
                  key={`${hint.kind}-${'environment' in hint ? hint.environment : 'userName' in hint ? hint.userName : 'skillName' in hint ? hint.skillName : ''}`}
                  className="flex flex-col gap-1"
                >
                  <HintLine
                    hint={hint}
                    organizationId={organizationId}
                    onShowMember={() =>
                      navigate({
                        to: '/organization/$organizationId/agent-experience/agent-activity',
                        params: { organizationId },
                      })
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}

function MemberOverview({ organizationId }: { organizationId: string }) {
  const weekRange = useRange(7)
  const week = useAgentActivity({ organizationId, scope: 'me', ...weekRange })
  const copilot = useCopilotStatus({ organizationId })
  return (
    <div className="flex flex-col gap-6" data-testid="agent-experience-state" data-state="member">
      <AgentExperienceHero organizationId={organizationId} compact />
      <Section
        aria-labelledby="member-copilot"
        className="flex flex-row flex-wrap items-center justify-between gap-3 rounded-md border border-neutral p-4"
      >
        <div className="flex items-center gap-3">
          <Heading level={2} id="member-copilot">
            Copilot
          </Heading>
          {copilot.isLoading ? (
            <Skeleton width={64} height={20} show />
          ) : (
            <OnOffBadge on={copilot.enabled} label={copilotStateLabel(copilot.enabled, copilot.readOnly)} />
          )}
        </div>
        <Link
          to="/organization/$organizationId/agent-experience/copilot"
          params={{ organizationId }}
          color="brand"
          size="sm"
        >
          What the Copilot does
        </Link>
      </Section>
      <Section aria-labelledby="member-receives" className="flex flex-col gap-2 rounded-md border border-neutral p-4">
        <Heading level={2} id="member-receives">
          What your agent receives
        </Heading>
        <PresetSummary />
      </Section>
      <Section aria-labelledby="member-week" className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <Heading level={2} id="member-week">
            Your agent this week
          </Heading>
          <Link
            to="/organization/$organizationId/agent-experience/agent-activity"
            params={{ organizationId }}
            color="brand"
            size="sm"
          >
            Your agent activity
          </Link>
        </div>
        {week.isLoading ? (
          <Skeleton height={72} className="w-full" show />
        ) : week.data ? (
          <WeekKpis week={week.data} showMembers={false} />
        ) : (
          <p className="text-sm text-neutral-subtle">Your agent activity could not be loaded.</p>
        )}
      </Section>
      <Section
        aria-labelledby="member-connect"
        className="flex flex-row flex-wrap items-center justify-between gap-3 rounded-md bg-surface-neutral-subtle p-4"
      >
        <div className="flex flex-col gap-0.5">
          <Heading level={2} id="member-connect">
            Connect your agent
          </Heading>
          <p className="text-sm text-neutral-subtle">Install the Qovery skills, the CLI or the MCP server.</p>
        </div>
        <Link
          as="button"
          to="/organization/$organizationId/agent-experience/connect"
          params={{ organizationId }}
          size="md"
          variant="outline"
          color="neutral"
        >
          How to connect
        </Link>
      </Section>
    </div>
  )
}

/**
 * The landing page of Agent Experience. Owners and admins get the setup checklist until agents, a
 * preset and a policy token are all in place, then what agents did. Members get their own setup.
 */
export function AgentExperienceOverview() {
  const { organizationId = '' } = useParams({ strict: false })
  const { canManage, isLoading } = useCanManageSkillPresets({ organizationId })
  useDocumentTitle('Agent Experience')

  return (
    <Section className="px-8 pb-8 pt-6">
      <SettingsHeading
        title={isLoading || canManage ? 'Agent Experience' : 'Your agent setup'}
        description={
          isLoading
            ? undefined
            : canManage
              ? 'Coding agents and the Qovery Copilot, working on your infrastructure under your rules: set them up, limit what they can do, and see what they did.'
              : 'What your coding agent receives from Qovery, and what it did. Only you and your organization’s owners and admins see your activity.'
        }
      />
      <div className="flex flex-col gap-6">
        <MockScenarioBanner />
        {isLoading ? (
          <Skeleton height={240} className="w-full" show />
        ) : canManage ? (
          <AdminOverview organizationId={organizationId} />
        ) : (
          <MemberOverview organizationId={organizationId} />
        )}
      </div>
    </Section>
  )
}
