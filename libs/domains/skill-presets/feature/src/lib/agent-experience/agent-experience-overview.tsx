import { useParams } from '@tanstack/react-router'
import clsx from 'clsx'
import { type ReactNode, useMemo, useState } from 'react'
import { type AgentActivityResponse } from '@qovery/domains/skill-presets/data-access'
import {
  Badge,
  Button,
  Callout,
  Heading,
  Icon,
  Link,
  ProgressBar,
  Section,
  Skeleton,
  useModal,
} from '@qovery/shared/ui'
import { timeAgo } from '@qovery/shared/util-dates'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { type ActivitySearch } from '../agent-activity/activity-search'
import { TURN_ON_AI_LABEL, TurnOnAiModal } from '../ai-features-notice/ai-features-notice'
import { useAgentActivity } from '../hooks/use-agent-activity/use-agent-activity'
import { useAgentExperiencePolicyTokens } from '../hooks/use-agent-experience-policy-tokens/use-agent-experience-policy-tokens'
import { useAiFeaturesEnabled } from '../hooks/use-ai-features-enabled/use-ai-features-enabled'
import { useCanManageSkillPresets } from '../hooks/use-can-manage-skill-presets/use-can-manage-skill-presets'
import { useCopilotStatus } from '../hooks/use-copilot-status/use-copilot-status'
import { useSkillPresetAssignees } from '../hooks/use-skill-preset-assignees/use-skill-preset-assignees'
import { useSkillPresets } from '../hooks/use-skill-presets/use-skill-presets'
import { LoadError } from '../load-error/load-error'
import { AssignmentChips } from '../settings-skill-presets/assignment-chips'
import { actionLabel, actorLabel, computeAgentActivityHints, memberCount, targetLabel } from '../utils/agent-activity'
import {
  type AgentExperienceSetup,
  type AgentExperienceStepId,
  computeAgentExperienceSetup,
} from '../utils/agent-experience'
import { OnOffBadge, copilotStateLabel } from './agent-experience-copilot'
import { PresetSummary } from './preset-summary'
import { ActorChip, AgentExperiencePage, Stat, StatGrid } from './ui/agent-experience-ui'

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

/** The same length of time just before `range`, to compare with. */
function usePreviousRange(range: { from: string; to: string; bucket: 'DAY' | 'HOUR' }) {
  return useMemo(() => {
    const from = new Date(range.from).getTime()
    const length = new Date(range.to).getTime() - from
    return { from: new Date(from - length).toISOString(), to: range.from, bucket: range.bucket }
  }, [range])
}

const STEPS: Record<AgentExperienceStepId, { title: string; description: string; done: string; action: string }> = {
  preset: {
    title: 'Set up your Skills Registry',
    description:
      'Create a preset from a template for your team’s profile: which Qovery skills agents load, and your team’s rules.',
    done: 'Your Skills Registry has a preset. Every agent you connect loads it.',
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
    description: 'Install the Qovery skills where your team codes. They load your organization’s preset.',
    done: 'Agents loaded skills or acted on Qovery in the last 30 days.',
    action: 'Connect your agent',
  },
}

type AgentExperiencePath =
  | '/organization/$organizationId/agent-experience/connect'
  | '/organization/$organizationId/agent-experience/skill-presets'
  | '/organization/$organizationId/agent-experience/skill-presets/new'
  | '/organization/$organizationId/agent-experience/policy-tokens'
  | '/organization/$organizationId/agent-experience/agent-activity'
  | '/organization/$organizationId/agent-experience/copilot'

const STEP_PATHS: Record<AgentExperienceStepId, AgentExperiencePath> = {
  connect: '/organization/$organizationId/agent-experience/connect',
  // The template gallery: one template per profile.
  preset: '/organization/$organizationId/agent-experience/skill-presets/new',
  'policy-token': '/organization/$organizationId/agent-experience/policy-tokens',
}
const ACTIVITY_PATH: AgentExperiencePath = '/organization/$organizationId/agent-experience/agent-activity'

type HeroPath =
  | AgentExperiencePath
  | '/organization/$organizationId/agent-experience/automate'
  | '/organization/$organizationId/agent-experience/build-optimizer'
  | '/organization/$organizationId/audit-logs'

const PILLARS: {
  id: string
  icon: 'compass' | 'shield-check' | 'binoculars'
  title: string
  text: string
  pieces: {
    icon: 'message-bot' | 'sparkles' | 'sliders' | 'key' | 'stairs' | 'gauge-high' | 'wave-pulse' | 'lock-keyhole'
    name: string
    to: HeroPath
  }[]
}[] = [
  {
    id: 'guide',
    icon: 'compass',
    title: 'Guide',
    text: 'Your Skills Registry, loaded by every agent you connect, and agents with one job, such as optimizing builds.',
    pieces: [
      {
        icon: 'sliders',
        name: 'Skills Registry',
        to: '/organization/$organizationId/agent-experience/skill-presets',
      },
      { icon: 'sparkles', name: 'Install skills', to: STEP_PATHS.connect },
      {
        icon: 'gauge-high',
        name: 'Optimize builds',
        to: '/organization/$organizationId/agent-experience/build-optimizer',
      },
    ],
  },
  {
    id: 'control',
    icon: 'shield-check',
    title: 'Control',
    text: 'Recurring agents run on their own with exactly the permissions their job needs, checked on every API call. Deny by default.',
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
      { icon: 'wave-pulse', name: 'Activity', to: ACTIVITY_PATH },
      { icon: 'lock-keyhole', name: 'Audit logs', to: '/organization/$organizationId/audit-logs' },
    ],
  },
]

export const HERO_TITLE = 'The future of infrastructure is agentic'
export const HERO_SUBTITLE =
  'Agents can do real infrastructure work on their own when every operation is checked at the API. Set that up here.'

/**
 * The story of Agents, for the first steps only: the full version with its three pillars when nothing
 * is set up, one sentence once a step is done, nothing once it is in use (the numbers come first).
 * It holds no action: the checklist's Next row does.
 */
function AgentExperienceHero({ organizationId, variant }: { organizationId: string; variant: 'full' | 'sentence' }) {
  if (variant === 'sentence') {
    return (
      <p className="text-sm text-neutral-subtle" data-testid="agent-experience-hero" data-variant="sentence">
        {HERO_SUBTITLE}
      </p>
    )
  }
  return (
    <Section
      aria-labelledby="agent-experience-hero"
      className="flex flex-col gap-4 rounded-md border border-neutral bg-surface-neutral-subtle p-5"
      data-testid="agent-experience-hero"
      data-variant="full"
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
  const variant = primary ? 'solid' : 'outline'
  const color = primary ? 'brand' : 'neutral'
  return (
    <Link as="button" to={STEP_PATHS[step]} params={{ organizationId }} size="md" variant={variant} color={color}>
      {STEPS[step].action}
    </Link>
  )
}

/**
 * AI features are on by default for new organizations. Older ones may still have them off: one
 * notice, with the one-action Turn on AI modal, instead of a setup step.
 */
function AiOffCallout({ organizationId, canEnable }: { organizationId: string; canEnable: boolean }) {
  const { openModal, closeModal } = useModal()
  return (
    <Callout.Root color="sky" data-testid="overview-ai-off">
      <Callout.Icon>
        <Icon iconName="circle-info" iconStyle="regular" />
      </Callout.Icon>
      <Callout.Text>
        <Callout.TextHeading>AI features are off for this organization</Callout.TextHeading>
        <Callout.TextDescription>
          The Skills Registry, the Copilot and Optimize builds need them.{' '}
          {canEnable ? 'One step turns them on, with the Copilot read-only.' : 'Ask an owner or admin to turn them on.'}
        </Callout.TextDescription>
      </Callout.Text>
      {canEnable && (
        <Button
          type="button"
          size="md"
          className="self-center"
          onClick={() => openModal({ content: <TurnOnAiModal organizationId={organizationId} onClose={closeModal} /> })}
        >
          {TURN_ON_AI_LABEL}
        </Button>
      )}
    </Callout.Root>
  )
}

/** The setup steps. The Next row holds the only primary button; the others get an outline one. */
function SetupChecklist({ setup, organizationId }: { setup: AgentExperienceSetup; organizationId: string }) {
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
              {!done && <StepAction step={id} primary={isNext} organizationId={organizationId} />}
            </li>
          )
        })}
      </ol>
    </Section>
  )
}

/**
 * The last 7 days, compared with the 7 days before. Each number opens Activity with the matching
 * filters. Denials are not red on their own: only a rise is.
 */
function WeekKpis({
  week,
  previous,
  showMembers,
}: {
  week: AgentActivityResponse
  previous?: AgentActivityResponse
  showMembers: boolean
}) {
  const delta = (current: number, before?: number) => (before === undefined ? undefined : current - before)
  return (
    <div data-testid="week-kpis">
      <StatGrid columns={showMembers ? 4 : 3} period="Last 7 days">
        <Stat
          label="Allowed actions"
          value={week.totals.actions}
          delta={delta(week.totals.actions, previous?.totals.actions)}
          search={{ range: '7d', outcome: 'ALLOWED' }}
        />
        <Stat
          label="Denied actions"
          icon="ban"
          value={week.totals.denials}
          delta={delta(week.totals.denials, previous?.totals.denials)}
          riseIsBad
          search={{ range: '7d', outcome: 'DENIED' }}
        />
        {showMembers && (
          <Stat
            label="Members with agents"
            value={memberCount(week)}
            delta={previous ? memberCount(week) - memberCount(previous) : undefined}
            search={{ range: '7d', actor: 'members' }}
          />
        )}
        <Stat
          label="Skill loads"
          value={week.totals.skill_loads}
          delta={delta(week.totals.skill_loads, previous?.totals.skill_loads)}
          search={{ range: '7d' }}
        />
      </StatGrid>
    </div>
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
  link: { label: string; to: AgentExperiencePath; search?: ActivitySearch }
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
        <Link
          to={link.to}
          params={{ organizationId }}
          // Only Activity takes filters; the other pages ignore an empty search.
          search={link.search as never}
          color="brand"
          size="sm"
        >
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
          <span className="flex items-center gap-1.5 pl-5 text-xs text-neutral-subtle">
            <ActorChip
              kind={actorLabel(action.user_name).kind}
              name={actorLabel(action.user_name).label.replace(/^Policy token /, '')}
            />
            <span>{timeAgo(new Date(action.at))} ago</span>
          </span>
        </li>
      ))}
    </ul>
  )
}

function AdminOverview({ organizationId }: { organizationId: string }) {
  const month = useRange(30)
  const weekRange = useRange(7)
  const activity = useAgentActivity({ organizationId, scope: 'organization', ...month })
  const week = useAgentActivity({ organizationId, scope: 'organization', ...weekRange })
  const previousRange = usePreviousRange(weekRange)
  const previousWeek = useAgentActivity({ organizationId, scope: 'organization', ...previousRange })
  const presets = useSkillPresets({ organizationId, isTemplate: false })
  const tokens = useAgentExperiencePolicyTokens({ organizationId })
  const { data: assignees } = useSkillPresetAssignees({ organizationId })
  const aiFeaturesEnabled = useAiFeaturesEnabled({ organizationId })
  const copilot = useCopilotStatus({ organizationId })

  const isLoading = activity.isLoading || presets.isLoading || tokens.isLoading
  const error = activity.error ?? presets.error ?? tokens.error
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading Agents">
        <Skeleton height={72} className="w-full" show />
        <Skeleton height={240} className="w-full" show />
      </div>
    )
  }
  if (error || !activity.data) {
    return (
      <LoadError
        title="Agents could not be loaded"
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
  })

  if (setup.state !== 'active') {
    return (
      <div className="flex flex-col gap-6" data-testid="agent-experience-state" data-state={setup.state}>
        {!aiFeaturesEnabled && <AiOffCallout organizationId={organizationId} canEnable />}
        <AgentExperienceHero organizationId={organizationId} variant={setup.state === 'empty' ? 'full' : 'sentence'} />
        <SetupChecklist setup={setup} organizationId={organizationId} />
        {setup.state === 'partial' && week.data && (
          <WeekKpis week={week.data} previous={previousWeek.data} showMembers />
        )}
      </div>
    )
  }

  const hints = computeAgentActivityHints(activity.data)
  const tokensByUse = [...policyTokens].sort((a, b) => (b.last_used_at ?? '').localeCompare(a.last_used_at ?? ''))
  return (
    <div className="flex flex-col gap-6" data-testid="agent-experience-state" data-state="active">
      {!aiFeaturesEnabled && <AiOffCallout organizationId={organizationId} canEnable />}
      {week.data && <WeekKpis week={week.data} previous={previousWeek.data} showMembers />}
      <div
        className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-md border border-neutral px-4 py-2.5 text-sm"
        data-testid="overview-copilot-state"
      >
        <span className="inline-flex items-center gap-2">
          <span className="text-neutral-subtle">Copilot</span>
          {copilot.isLoading ? (
            <Skeleton width={64} height={20} show />
          ) : (
            <OnOffBadge on={copilot.enabled} label={copilotStateLabel(copilot.enabled, copilot.readOnly)} />
          )}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="text-neutral-subtle">AI features</span>
          <OnOffBadge on={aiFeaturesEnabled} />
        </span>
        {aiFeaturesEnabled && (
          <Link
            to="/organization/$organizationId/agent-experience/build-optimizer"
            params={{ organizationId }}
            color="brand"
            size="sm"
            className="inline-flex items-center gap-1.5"
          >
            <Icon iconName="gauge-high" iconStyle="regular" aria-hidden="true" />
            AI capability on: Build Optimizer
          </Link>
        )}
        {hints.length > 0 && (
          <Link
            to="/organization/$organizationId/agent-experience/agent-activity"
            params={{ organizationId }}
            color="brand"
            size="sm"
            data-testid="overview-suggestions-link"
          >
            {hints.length} {hints.length === 1 ? 'suggestion' : 'suggestions'} in Activity
          </Link>
        )}
        <Link
          to="/organization/$organizationId/agent-experience/copilot"
          params={{ organizationId }}
          color="brand"
          size="sm"
          className="ml-auto"
        >
          Copilot settings
        </Link>
      </div>
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
        <Card
          id="overview-presets"
          title="Active presets"
          link={{ label: 'Skills Registry', to: '/organization/$organizationId/agent-experience/skill-presets' }}
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
        </Card>
        <Card
          className="xl:col-span-2"
          id="overview-denied-title"
          title="Latest denied actions"
          link={{
            label: 'See all denied',
            to: '/organization/$organizationId/agent-experience/agent-activity',
            search: { range: '7d', outcome: 'DENIED' },
          }}
        >
          <DeniedList activity={week.data ?? activity.data} />
        </Card>
      </div>
    </div>
  )
}

function MemberOverview({ organizationId }: { organizationId: string }) {
  const weekRange = useRange(7)
  const week = useAgentActivity({ organizationId, scope: 'me', ...weekRange })
  const previousWeek = useAgentActivity({ organizationId, scope: 'me', ...usePreviousRange(weekRange) })
  const copilot = useCopilotStatus({ organizationId })
  const aiFeaturesEnabled = useAiFeaturesEnabled({ organizationId })
  return (
    <div className="flex flex-col gap-6" data-testid="agent-experience-state" data-state="member">
      {!aiFeaturesEnabled && <AiOffCallout organizationId={organizationId} canEnable={false} />}
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
      </Section>
      <Section aria-labelledby="member-receives" className="flex flex-col gap-2 rounded-md border border-neutral p-4">
        <Heading level={2} id="member-receives">
          What your agent receives
        </Heading>
        <PresetSummary />
      </Section>
      <Section aria-labelledby="member-week" className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <Heading level={2} id="member-week" className="sr-only">
            Your agent
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
          <WeekKpis week={week.data} previous={previousWeek.data} showMembers={false} />
        ) : (
          <p className="text-sm text-neutral-subtle">Your agent activity could not be loaded.</p>
        )}
      </Section>
    </div>
  )
}

/**
 * Connecting is a one-time setup per machine, so it is not in the side menu. This button keeps it one
 * click away for the next laptop or CI runner.
 */
function ConnectAgentButton({ organizationId }: { organizationId: string }) {
  return (
    <Link
      as="button"
      to="/organization/$organizationId/agent-experience/connect"
      params={{ organizationId }}
      size="md"
      variant="outline"
      color="neutral"
      className="gap-1.5"
    >
      <Icon iconName="plug" iconStyle="regular" aria-hidden="true" />
      Connect an agent
    </Link>
  )
}

/**
 * The landing page of Agents. Owners and admins get the setup checklist until agents, a
 * preset and a policy token are all in place, then what agents did. Members get their own setup.
 */
export function AgentExperienceOverview() {
  const { organizationId = '' } = useParams({ strict: false })
  const { canManage, isLoading } = useCanManageSkillPresets({ organizationId })
  useDocumentTitle(!isLoading && !canManage ? 'Your agent setup - Agents' : 'Agents')

  return (
    <AgentExperiencePage
      title={isLoading || canManage ? 'Agents' : 'Your agent setup'}
      description={
        isLoading
          ? undefined
          : canManage
            ? 'Coding agents and the Copilot on your infrastructure, under your rules.'
            : 'What your coding agent receives from Qovery, and what it did.'
      }
      showHelp
      action={<ConnectAgentButton organizationId={organizationId} />}
    >
      {isLoading ? (
        <Skeleton height={240} className="w-full" show />
      ) : canManage ? (
        <AdminOverview organizationId={organizationId} />
      ) : (
        <MemberOverview organizationId={organizationId} />
      )}
    </AgentExperiencePage>
  )
}
