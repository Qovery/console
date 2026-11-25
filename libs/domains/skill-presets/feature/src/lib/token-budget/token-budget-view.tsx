import { useId } from 'react'
import { Button, Heading, Icon, Section, TablePrimitives, Tooltip } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import { QOVERY_SKILLS } from '../utils/qovery-skills'
import { type TokenBudget, formatTokens } from '../utils/token-budget'

const { Table } = TablePrimitives

export interface TokenBudgetViewProps {
  budget: TokenBudget
  /** Shows the six heaviest skills only. */
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
  const id = useId()
  // No preset: the agent keeps today's install, so only that line applies.
  const hasPreset = alwaysInContext.loader > 0

  return (
    <div className={twMerge('flex flex-col gap-4 text-xs', className)}>
      <Section aria-labelledby={`${id}-always`} className="flex flex-col gap-2">
        <div className="flex items-center gap-1">
          <Heading level={3} id={`${id}-always`} className="text-sm">
            Always in context
          </Heading>
          <Tooltip content="Read at the start of every session, before any task.">
            <Button
              type="button"
              variant="plain"
              color="neutral"
              size="xs"
              iconOnly
              aria-label="About always in context"
            >
              <Icon iconName="circle-info" iconStyle="regular" />
            </Button>
          </Tooltip>
        </div>
        {hasPreset && (
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
        )}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-neutral-subtle">
            <span>{hasPreset ? 'Today, with no preset' : 'No preset: the Qovery skills as published'}</span>
            <span className="tabular-nums">{formatTokens(todayAlwaysInContext)} tokens</span>
          </div>
          <Bar
            max={max}
            segments={[
              { label: 'Qovery descriptions', tokens: todayAlwaysInContext, className: 'bg-surface-neutral-solid' },
            ]}
          />
          <span className="text-neutral-subtle">All {QOVERY_SKILLS.length} Qovery skill descriptions</span>
        </div>
      </Section>

      <Section aria-labelledby={`${id}-on-demand`} className="flex flex-col gap-2">
        <Heading level={3} id={`${id}-on-demand`} className="text-sm">
          Loaded only when a task needs it
        </Heading>
        {rows.length === 0 ? (
          <p className="text-neutral-subtle">Nothing: this preset loads no skill.</p>
        ) : (
          <Table.Root aria-label="Tokens added per skill when a task loads it">
            <Table.Header className="text-xs">
              <Table.Row>
                <Table.ColumnHeaderCell className="font-sans font-medium">Skill</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="text-right font-sans font-medium">Per task</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {(compact ? rows.slice(0, 6) : rows).map((row) => (
                <Table.Row key={row.skillName} className="align-top">
                  <Table.Cell className="h-auto py-3">
                    <span className="block font-medium text-neutral">{row.skillName}</span>
                    <span className="block text-ssm text-neutral-subtle">
                      {[
                        row.qoveryTokens > 0 && `Qovery ${formatTokens(row.qoveryTokens)}`,
                        row.organizationTokens > 0 && `yours ${formatTokens(row.organizationTokens)}`,
                        row.teamContextTokens > 0 && `team context ${formatTokens(row.teamContextTokens)}`,
                      ]
                        .filter(Boolean)
                        .join(' + ')}
                    </span>
                  </Table.Cell>
                  <Table.Cell className="h-auto whitespace-nowrap py-3 text-right tabular-nums text-neutral">
                    {formatTokens(row.total)}
                    {row.todayTokens !== null && row.todayTokens !== row.total && (
                      <span className="block text-ssm text-neutral-subtle">today {formatTokens(row.todayTokens)}</span>
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        )}
        {compact && rows.length > 6 && <p className="text-neutral-subtle">And {rows.length - 6} more skills.</p>}
        {disabled.length > 0 && (
          <p className="text-neutral-subtle">
            <Icon iconName="ban" iconStyle="regular" className="mr-1" aria-hidden="true" />
            Never loaded: <span>{disabled.join(', ')}</span>
          </p>
        )}
      </Section>

      <p className="text-neutral-subtle">
        Estimates: characters divided by 4. Qovery skill sizes are measured on one release of the Qovery skills. Their
        reference files load only when a step needs them and are not counted.
      </p>
    </div>
  )
}
