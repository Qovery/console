import { Icon, Tooltip } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { type TokenBudget, formatTokens } from '../utils/token-budget'

export interface TokenBudgetViewProps {
  budget: TokenBudget
  /** Rows to show before "Show all". */
  compact?: boolean
  className?: string
}

function Bar({ segments, max }: { segments: { label: string; tokens: number; className: string }[]; max: number }) {
  return (
    <div className="flex h-2 w-full overflow-hidden rounded-full bg-surface-neutral-component" aria-hidden="true">
      {segments.map((segment) => (
        <div
          key={segment.label}
          className={twMerge('h-full', segment.className)}
          style={{ width: `${Math.max((segment.tokens / max) * 100, segment.tokens > 0 ? 2 : 0)}%` }}
        />
      ))}
    </div>
  )
}

/**
 * Estimated context cost for one member: what sits in the agent's context all the time, and what each
 * skill adds when a task needs it, compared with today's install with no preset.
 */
export function TokenBudgetView({ budget, compact = false, className }: TokenBudgetViewProps) {
  const { alwaysInContext, todayAlwaysInContext, onDemand, disabled } = budget
  const max = Math.max(alwaysInContext.total, todayAlwaysInContext)
  const rows = [...onDemand].sort((a, b) => b.total - a.total)

  return (
    <div className={twMerge('flex flex-col gap-4 text-xs', className)}>
      <section aria-labelledby="budget-always" className="flex flex-col gap-2">
        <h3 id="budget-always" className="flex items-center gap-1.5 text-sm font-medium text-neutral">
          Always in context
          <Tooltip content="Read at the start of every session, before any task.">
            <span>
              <Icon
                iconName="circle-info"
                iconStyle="regular"
                className="text-neutral-subtle"
                aria-label="About this"
              />
            </span>
          </Tooltip>
        </h3>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-neutral">
            <span>With this preset</span>
            <span className="tabular-nums">{formatTokens(alwaysInContext.total)} tokens</span>
          </div>
          <Bar
            max={max}
            segments={[
              { label: 'Loader skill', tokens: alwaysInContext.loader, className: 'bg-surface-brand-solid' },
              { label: 'Skill list', tokens: alwaysInContext.manifest, className: 'bg-surface-brand-component' },
            ]}
          />
          <span className="text-neutral-subtle">
            Loader skill {formatTokens(alwaysInContext.loader)} + skill list {formatTokens(alwaysInContext.manifest)}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-neutral-subtle">
            <span>Today, with no preset</span>
            <span className="tabular-nums">{formatTokens(todayAlwaysInContext)} tokens</span>
          </div>
          <Bar
            max={max}
            segments={[
              { label: 'Qovery descriptions', tokens: todayAlwaysInContext, className: 'bg-surface-neutral-solid' },
            ]}
          />
          <span className="text-neutral-subtle">All 11 Qovery skill descriptions</span>
        </div>
      </section>

      <section aria-labelledby="budget-on-demand" className="flex flex-col gap-2">
        <h3 id="budget-on-demand" className="text-sm font-medium text-neutral">
          Loaded only when a task needs it
        </h3>
        {rows.length === 0 ? (
          <p className="text-neutral-subtle">Nothing: this preset loads no skill.</p>
        ) : (
          <table className="w-full text-left">
            <caption className="sr-only">Tokens added per skill when a task loads it</caption>
            <thead className="text-neutral-subtle">
              <tr>
                <th scope="col" className="pb-1 font-normal">
                  Skill
                </th>
                <th scope="col" className="pb-1 text-right font-normal">
                  Per task
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral">
              {(compact ? rows.slice(0, 6) : rows).map((row) => (
                <tr key={row.skillName} className="align-top">
                  <td className="py-1.5 pr-2">
                    <span className="block font-code text-neutral">{row.skillName}</span>
                    <span className="block text-neutral-subtle">
                      {[
                        row.qoveryTokens > 0 && `Qovery ${formatTokens(row.qoveryTokens)}`,
                        row.organizationTokens > 0 && `yours ${formatTokens(row.organizationTokens)}`,
                        row.teamContextTokens > 0 && `team context ${formatTokens(row.teamContextTokens)}`,
                      ]
                        .filter(Boolean)
                        .join(' + ')}
                    </span>
                  </td>
                  <td className="py-1.5 text-right tabular-nums text-neutral">
                    {formatTokens(row.total)}
                    {row.todayTokens !== null && row.todayTokens !== row.total && (
                      <span className="block text-neutral-subtle">today {formatTokens(row.todayTokens)}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {compact && rows.length > 6 && <p className="text-neutral-subtle">And {rows.length - 6} more skills.</p>}
        {disabled.length > 0 && (
          <p className="text-neutral-subtle">
            <Icon iconName="ban" iconStyle="regular" className="mr-1" aria-hidden="true" />
            Never loaded: <span className="font-code">{disabled.join(', ')}</span>
          </p>
        )}
      </section>

      <p className="text-neutral-subtle">
        Estimates: characters divided by 4. Qovery skill sizes are measured on one release of the Qovery skills. Their
        reference files load only when a step needs them and are not counted.
      </p>
    </div>
  )
}
