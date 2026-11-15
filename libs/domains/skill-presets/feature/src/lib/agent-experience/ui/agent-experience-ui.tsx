import { type ReactNode } from 'react'
import { SettingsHeading } from '@qovery/shared/console-shared'
import { Badge, Icon, Section } from '@qovery/shared/ui'
import { MockScenarioBanner } from '../../mock-scenario-banner/mock-scenario-banner'

/*
 * The shared pieces of the Agent Experience pages, so every page reads the same way: one header
 * pattern, one wording and color for allowed and denied, one chip for members and policy tokens.
 */

/** Page frame: heading, description, an optional action, the mock banner, then the content. */
export function AgentExperiencePage({
  title,
  description,
  action,
  children,
}: {
  title: string
  description?: ReactNode
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <Section className="px-8 pb-8 pt-6">
      <SettingsHeading title={title} description={description}>
        {action}
      </SettingsHeading>
      <div className="flex flex-col gap-6">
        <MockScenarioBanner />
        {children}
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

/** A row of numbers above a page or a section. */
export function StatGrid({ children, columns }: { children: ReactNode; columns: 3 | 4 | 5 }) {
  const lg = { 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5' }[columns]
  return (
    <dl className={`grid grid-cols-2 divide-x divide-neutral rounded-md border border-neutral ${lg}`}>{children}</dl>
  )
}

export function Stat({ label, value, tone }: { label: string; value: number; tone?: 'denied' }) {
  return (
    <div className="flex flex-col gap-0.5 px-4 py-3">
      <dt className="text-xs text-neutral-subtle">{label}</dt>
      <dd
        className={`text-base font-medium tabular-nums ${tone === 'denied' && value > 0 ? 'text-negative' : 'text-neutral'}`}
      >
        {value.toLocaleString('en-US')}
      </dd>
    </div>
  )
}
