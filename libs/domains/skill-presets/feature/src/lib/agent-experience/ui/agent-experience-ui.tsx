import { type IconName } from '@fortawesome/fontawesome-common-types'
import { Link, useParams } from '@tanstack/react-router'
import { type ReactNode } from 'react'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Badge, Heading, Icon, Section } from '@qovery/shared/ui'
import { type ActivitySearch } from '../../agent-activity/activity-search'
import { MockScenarioBanner } from '../../mock-scenario-banner/mock-scenario-banner'

/*
 * The shared pieces of the Agents pages, so every page reads the same way: one header
 * pattern, one wording and color for allowed and denied, one chip for members and policy tokens.
 */

/**
 * Page frame: heading, a one-line description, an optional action, then the content. One width
 * rule: reading pages (forms, instructions) are narrow, tables and dashboards use the full width.
 * The help chip shows on the Overview only.
 */
export function AgentExperiencePage({
  title,
  titleBadge,
  description,
  action,
  width = 'full',
  showHelp = false,
  children,
}: {
  title: string
  titleBadge?: ReactNode
  description?: ReactNode
  action?: ReactNode
  width?: 'full' | 'reading'
  showHelp?: boolean
  children: ReactNode
}) {
  return (
    <Section className="px-8 pb-8 pt-6">
      <SettingsHeading title={title} titleBadge={titleBadge} description={description} showNeedHelp={showHelp}>
        {action}
      </SettingsHeading>
      <div className={`flex flex-col gap-6 ${width === 'reading' ? 'max-w-content-with-navigation-left' : ''}`}>
        {children}
        <MockScenarioBanner />
      </div>
    </Section>
  )
}

export const OUTCOME_LABELS = { ALLOWED: 'Allowed', DENIED: 'Denied' } as const

/** Allowed or denied, the same everywhere: a check in neutral, a ban in red. */
export function OutcomeBadge({ outcome }: { outcome: 'ALLOWED' | 'DENIED' }) {
  return outcome === 'DENIED' ? (
    <Badge variant="surface" color="red" className="gap-1 whitespace-nowrap">
      <Icon iconName="ban" iconStyle="regular" aria-hidden="true" />
      {OUTCOME_LABELS.DENIED}
    </Badge>
  ) : (
    <Badge variant="outline" className="gap-1 whitespace-nowrap">
      <Icon iconName="check" iconStyle="regular" aria-hidden="true" />
      {OUTCOME_LABELS.ALLOWED}
    </Badge>
  )
}

/** Who acted: a member (person icon) or a policy token (key icon), deleted tokens marked so. */
export function ActorChip({
  kind,
  name,
  deleted = false,
  prefix = true,
}: {
  kind: 'member' | 'policy-token'
  name: string
  deleted?: boolean
  /** "Policy token <name>". Off where the context already says it, as on the policy tokens page. */
  prefix?: boolean
}) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap" data-actor-kind={kind}>
      <Icon
        iconName={kind === 'policy-token' ? 'key' : 'user'}
        iconStyle="regular"
        className="text-neutral-subtle"
        aria-hidden="true"
      />
      <span className={deleted ? 'text-neutral-subtle line-through' : undefined}>
        {kind === 'policy-token' && prefix ? `Policy token ${name}` : name}
      </span>
      {deleted && (
        <Badge variant="outline" size="sm" color="neutral">
          Deleted
        </Badge>
      )}
    </span>
  )
}

/** A row of numbers, with the period said once above it ("Last 7 days"). */
export function StatGrid({ children, columns, period }: { children: ReactNode; columns: 3 | 4 | 5; period?: string }) {
  const lg = { 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5' }[columns]
  return (
    <div className="flex flex-col gap-2">
      {period && (
        <Heading level={2} className="text-sm" data-testid="stat-period">
          {period}
        </Heading>
      )}
      <dl className={`grid grid-cols-2 gap-3 ${lg}`} data-testid="stat-grid">
        {children}
      </dl>
    </div>
  )
}

/**
 * One number. With `search`, a card that opens Activity with those filters, and looks clickable (hover
 * border, chevron). `delta` compares with the previous period, in neutral text; it turns red only when
 * denials rise (`riseIsBad`), which is a real signal, while a denied count on its own is not.
 */
export function Stat({
  label,
  value,
  icon,
  delta,
  riseIsBad = false,
  search,
}: {
  label: string
  value: number
  icon?: IconName
  delta?: number
  riseIsBad?: boolean
  search?: ActivitySearch
}) {
  const { organizationId = '' } = useParams({ strict: false })
  const content = (
    <>
      <dt className="flex items-center gap-1.5 text-xs text-neutral-subtle">
        {icon && <Icon iconName={icon} iconStyle="regular" aria-hidden="true" />}
        {label}
      </dt>
      <dd className="flex items-baseline gap-2">
        <span className="text-base font-medium tabular-nums text-neutral">{value.toLocaleString('en-US')}</span>
        {delta !== undefined && delta !== 0 && (
          <span
            className={`text-xs ${riseIsBad && delta > 0 ? 'text-negative' : 'text-neutral-subtle'}`}
            data-testid="stat-delta"
          >
            {delta > 0 ? '+' : ''}
            {delta} vs previous period
          </span>
        )}
      </dd>
    </>
  )
  if (!search) {
    return <div className="flex flex-col gap-0.5 rounded-md border border-neutral px-4 py-3">{content}</div>
  }
  return (
    <Link
      to="/organization/$organizationId/agent-experience/agent-activity"
      params={{ organizationId }}
      search={search}
      className="group relative flex flex-col gap-0.5 rounded-md border border-neutral px-4 py-3 pr-8 transition-colors hover:border-brand-strong hover:bg-surface-neutral-subtle focus-visible:border-brand-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-strong"
      aria-label={`${label}: ${value.toLocaleString('en-US')}. Open in Activity`}
      data-testid="stat-link"
    >
      {content}
      <Icon
        iconName="chevron-right"
        iconStyle="regular"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-subtle group-hover:text-neutral"
        aria-hidden="true"
      />
    </Link>
  )
}

/**
 * The coding agents the Qovery skills support (qovery-skills README), with the logos the Console
 * already ships in /assets/ai-tools. Cursor's mark is drawn in the text color, so it reads in dark mode.
 * VS Code Copilot has no logo in the Console: it is named only.
 */
export const CODING_AGENTS: { name: string; src?: string; currentColor?: boolean }[] = [
  { name: 'Claude Code', src: '/assets/ai-tools/claude.svg' },
  { name: 'Codex', src: '/assets/ai-tools/codex.png' },
  { name: 'Cursor', src: '/assets/ai-tools/cursor.svg', currentColor: true },
  { name: 'OpenCode', src: '/assets/ai-tools/opencode.svg' },
  { name: 'Gemini CLI', src: '/assets/ai-tools/gemini.png' },
  { name: 'VS Code Copilot' },
]

/** A compact row of the supported coding agents: logo and name. */
export function CodingAgentLogos({ className }: { className?: string }) {
  return (
    <ul
      className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 ${className ?? ''}`}
      aria-label="Supported coding agents"
    >
      {CODING_AGENTS.map(({ name, src, currentColor }) => (
        <li key={name} className="inline-flex items-center gap-1.5 text-xs text-neutral" data-testid="coding-agent">
          {src &&
            (currentColor ? (
              <span
                aria-hidden="true"
                className="h-3.5 w-3.5 bg-current"
                style={{
                  mask: `url(${src}) center / contain no-repeat`,
                  WebkitMask: `url(${src}) center / contain no-repeat`,
                }}
              />
            ) : (
              <img src={src} alt="" aria-hidden="true" className="h-3.5 w-3.5 object-contain" />
            ))}
          {name}
        </li>
      ))}
    </ul>
  )
}
