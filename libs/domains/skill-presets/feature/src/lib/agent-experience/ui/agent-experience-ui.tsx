import { type IconName } from '@fortawesome/fontawesome-common-types'
import { type ReactNode } from 'react'
import { NeedHelp } from '@qovery/shared/assistant/feature'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Badge, Heading, Icon, Section } from '@qovery/shared/ui'

/*
 * The shared pieces of the Agents pages, so every page reads the same way: one header
 * pattern, one wording and color for allowed and denied, one chip for members and policy tokens.
 */

/** Page frame: heading, description, an optional action, then the content. */
export function AgentExperiencePage({
  title,
  titleBadge,
  description,
  action,
  width = 'full',
  showHelp = false,
  layout = 'settings',
  children,
}: {
  title: string
  titleBadge?: ReactNode
  description?: ReactNode
  action?: ReactNode
  width?: 'full' | 'reading'
  showHelp?: boolean
  layout?: 'settings' | 'dashboard'
  children: ReactNode
}) {
  return (
    <Section className={layout === 'dashboard' ? 'p-6' : 'px-6 pb-8 pt-6 md:px-8'}>
      {layout === 'dashboard' ? (
        <header className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Heading level={1}>{title}</Heading>
            {description && <p className="text-sm text-neutral-subtle">{description}</p>}
            {showHelp && <NeedHelp className="mt-3" />}
          </div>
          {action}
        </header>
      ) : (
        <SettingsHeading
          title={title}
          titleBadge={titleBadge}
          description={description}
          showNeedHelp={showHelp}
          stackActionsOnMobile
        >
          {action}
        </SettingsHeading>
      )}
      <div className={`flex flex-col gap-6 ${width === 'reading' ? 'max-w-content-with-navigation-left' : ''}`}>
        {children}
      </div>
    </Section>
  )
}

export const OUTCOME_LABELS = { ALLOWED: 'Allowed', DENIED: 'Denied' } as const

/** Allowed or denied, the same everywhere: a check in neutral, a ban in red. */
export function OutcomeBadge({ outcome }: { outcome: 'ALLOWED' | 'DENIED' }) {
  return outcome === 'DENIED' ? (
    <Badge variant="surface" color="red" size="base" className="gap-1 whitespace-nowrap font-medium">
      <Icon iconName="ban" iconStyle="regular" aria-hidden="true" />
      {OUTCOME_LABELS.DENIED}
    </Badge>
  ) : (
    <Badge variant="outline" size="base" className="gap-1 whitespace-nowrap font-medium">
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
        <Badge variant="surface" size="base" color="neutral" className="font-medium">
          Deleted
        </Badge>
      )}
    </span>
  )
}

/** A row of numbers, with the period said once above it ("Last 7 days"). */
export function StatGrid({
  children,
  columns,
  period,
}: {
  children: ReactNode
  columns: 2 | 3 | 4 | 5
  period?: string
}) {
  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-2 lg:grid-cols-5',
  }[columns]
  return (
    <div className="flex flex-col gap-2">
      {period && (
        <Heading level={2} className="text-sm" data-testid="stat-period">
          {period}
        </Heading>
      )}
      <dl className={`grid gap-3 ${columnClasses}`} data-testid="stat-grid">
        {children}
      </dl>
    </div>
  )
}

/** A metric with an optional comparison against the previous period. */
export function Stat({
  label,
  value,
  icon,
  delta,
  riseIsBad = false,
  prominent = false,
}: {
  label: string
  value: number
  icon?: IconName
  delta?: number
  riseIsBad?: boolean
  prominent?: boolean
}) {
  return (
    <div
      className={`flex flex-col rounded-md border border-neutral px-4 py-3 ${prominent ? 'min-h-28 justify-between gap-3 bg-surface-neutral' : 'gap-0.5'}`}
    >
      <dt className="flex items-center gap-1.5 text-xs text-neutral-subtle">
        {icon && <Icon iconName={icon} iconStyle="regular" aria-hidden="true" />}
        {label}
      </dt>
      <dd className={prominent ? 'flex min-h-14 flex-col gap-0.5' : 'flex items-baseline gap-2'}>
        <span className={`${prominent ? 'text-3xl' : 'text-base'} font-medium tabular-nums text-neutral`}>
          {value.toLocaleString('en-US')}
        </span>
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
    </div>
  )
}
