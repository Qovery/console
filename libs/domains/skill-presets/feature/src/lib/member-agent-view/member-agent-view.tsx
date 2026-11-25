import { type SkillPresetManifestSkill, type SkillPresetResolutionSource } from 'qovery-typescript-axios'
import { useId, useState } from 'react'
import { getSkillPresetErrorStatus } from '@qovery/domains/skill-presets/util'
import { Badge, Button, Callout, Heading, Icon, Section, Skeleton, TablePrimitives, Tooltip } from '@qovery/shared/ui'
import { useResolvedSkillPreset } from '../hooks/use-resolved-skill-preset/use-resolved-skill-preset'
import { useResolvedSkill } from '../hooks/use-resolved-skill/use-resolved-skill'
import { useSkillPresetAssignees } from '../hooks/use-skill-preset-assignees/use-skill-preset-assignees'
import { LoadError } from '../load-error/load-error'
import { TokenBudgetView } from '../token-budget/token-budget-view'
import { baseLabel } from '../utils/qovery-skills'
import { computeTokenBudgetFromManifest, formatTokens } from '../utils/token-budget'

const { Table } = TablePrimitives

const MODE_LABELS: Record<SkillPresetManifestSkill['mode'], string> = {
  ADD: 'Your organization’s skill',
  OVERLAY: 'Qovery skill, then team instructions',
  REPLACE: 'Replaces the Qovery skill',
  DISABLE: 'Never loaded',
}

/** Why this preset applies, addressed to the member. */
const SOURCE_LABELS: Record<SkillPresetResolutionSource, string> = {
  USER: 'Assigned to you',
  ROLE: 'Assigned to your role',
  ORGANIZATION: 'The organization default',
  QOVERY_DEFAULT: 'No preset applies',
}

const ADMIN_ROLE_NAMES = ['owner', 'admin']

function Hash({ value }: { value: string }) {
  return (
    <Tooltip content={value}>
      <span tabIndex={0} className="font-code text-xs text-neutral-subtle">
        {value.slice(0, 12)}
      </span>
    </Tooltip>
  )
}

interface PieceRowProps {
  organizationId: string
  name: string
  /** Shown under the name. */
  detail: string
  tokens: number | null
  sha256: string | null
  /** The skill to fetch: the team context comes with any skill, so it reads `qovery`. */
  skillName: string | null
  pick: 'content' | 'teamContext'
}

/** One piece the agent can receive. Its full text loads only when the member opens it. */
function PieceRow({ organizationId, name, detail, tokens, sha256, skillName, pick }: PieceRowProps) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const { data, isLoading, error, refetch } = useResolvedSkill({
    organizationId,
    skillName: skillName ?? '',
    enabled: open && skillName !== null,
  })
  const text = pick === 'content' ? data?.content : data?.team_context
  const fullHash = pick === 'content' ? data?.content_sha256 : data?.team_context_sha256

  return (
    <>
      <Table.Row>
        <Table.Cell className="h-auto py-2">
          <span className="flex flex-col">
            <span className={pick === 'content' ? 'font-code text-neutral' : 'font-medium text-neutral'}>{name}</span>
            <span className="text-neutral-subtle">{detail}</span>
          </span>
        </Table.Cell>
        <Table.Cell className="text-right tabular-nums">
          {tokens === null ? <span className="text-neutral-subtle">None</span> : `${formatTokens(tokens)} tokens`}
        </Table.Cell>
        <Table.Cell>{sha256 ? <Hash value={sha256} /> : <span className="text-neutral-subtle">None</span>}</Table.Cell>
        <Table.Cell className="text-right">
          {skillName && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              color="neutral"
              aria-expanded={open}
              aria-controls={open ? panelId : undefined}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? 'Hide' : 'Read'}
              <Icon iconName={open ? 'chevron-up' : 'chevron-down'} iconStyle="regular" />
            </Button>
          )}
        </Table.Cell>
      </Table.Row>
      {open && (
        <Table.Row>
          <Table.Cell colSpan={4} className="h-auto bg-surface-neutral-subtle py-3" id={panelId}>
            {isLoading && <Skeleton height={80} className="w-full" show />}
            {error && getSkillPresetErrorStatus(error) === 404 ? (
              // The preset changed since the list loaded: retrying would not help.
              <p className="text-sm text-neutral-subtle" data-testid="skill-gone">
                {name} is no longer in your preset. Reload the page to see what your agent receives now.
              </p>
            ) : error ? (
              <LoadError title={`${name} could not be loaded`} error={error} onRetry={() => refetch()} />
            ) : null}
            {data && (
              <div className="flex flex-col gap-2">
                <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-md border border-neutral bg-surface-neutral p-3 font-code text-xs text-neutral">
                  {text || 'Empty.'}
                </pre>
                {fullHash && <p className="break-all font-code text-xs text-neutral-subtle">SHA-256 {fullHash}</p>}
              </div>
            )}
          </Table.Cell>
        </Table.Row>
      )}
    </>
  )
}

/** Owners and admins of the organization, when the members list is readable. Otherwise nothing. */
function AdminNames({ organizationId }: { organizationId: string }) {
  const { data: assignees } = useSkillPresetAssignees({ organizationId })
  if (!assignees) return null
  const adminRoleIds = assignees.roles
    .filter(({ name }) => ADMIN_ROLE_NAMES.includes(name.toLowerCase()))
    .map(({ id }) => id)
  const admins = assignees.members.filter(({ role_id }) => role_id && adminRoleIds.includes(role_id))
  if (admins.length === 0) return null
  return <> Owners and admins: {admins.map(({ name }) => name).join(', ')}.</>
}

/**
 * Read-only page for members without admin rights: which preset applies to them and why, every
 * piece their agent can receive, readable in full with its hash, and what it costs in context.
 * Built from the same resolved endpoints the agent reads, never from admin endpoints.
 */
export function MemberAgentView({ organizationId }: { organizationId: string }) {
  const { data: manifest, isLoading, error, refetch } = useResolvedSkillPreset({ organizationId })
  const preset = manifest?.skill_preset

  return (
    <div className="flex flex-col gap-6">
      <Callout.Root color="neutral">
        <Callout.Icon>
          <Icon iconName="lock" iconStyle="regular" />
        </Callout.Icon>
        <Callout.Text>
          <Callout.TextDescription>
            Only organization owners and admins can change the Skills registry. Ask one of them if your agent needs
            something different.
            <AdminNames organizationId={organizationId} />
          </Callout.TextDescription>
        </Callout.Text>
      </Callout.Root>

      <Section aria-labelledby="member-agent-title" className="flex flex-col gap-3">
        <Heading level={2} id="member-agent-title">
          What your agent receives
        </Heading>
        {isLoading && <Skeleton height={160} className="w-full" show />}
        {error ? (
          <LoadError
            title="Your preset could not be loaded"
            error={error}
            onRetry={() => refetch()}
            note="Your agent keeps working with the preset it last loaded."
          />
        ) : null}
        {manifest && !preset && (
          <p className="text-sm text-neutral" data-testid="member-no-preset">
            No preset applies. Your agent uses the Qovery skills as published.
          </p>
        )}
        {preset && (
          <>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-2 rounded-md border border-neutral p-4 text-sm sm:grid-cols-4">
              <div className="flex flex-col">
                <dt className="text-xs text-neutral-subtle">Preset</dt>
                <dd className="font-medium text-neutral">{preset.name}</dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-xs text-neutral-subtle">Why it applies</dt>
                <dd className="text-neutral">{SOURCE_LABELS[manifest.source]}</dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-xs text-neutral-subtle">Starts from</dt>
                <dd className="text-neutral">{baseLabel(preset.base)}</dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-xs text-neutral-subtle">Revision</dt>
                <dd>
                  <Badge variant="surface">Revision {preset.revision}</Badge>
                </dd>
              </div>
            </dl>
            <Table.Root>
              <Table.Header className="[&_th]:whitespace-nowrap [&_th]:text-xs [&_th]:font-medium">
                <Table.Row>
                  <Table.ColumnHeaderCell>What your agent can load</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="text-right">Size</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>SHA-256</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>
                    <span className="sr-only">Full text</span>
                  </Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {preset.team_context && (
                  <PieceRow
                    organizationId={organizationId}
                    name="Team context"
                    detail="Sent with every skill your agent loads"
                    tokens={preset.team_context.approx_tokens}
                    sha256={preset.team_context.sha256}
                    skillName="qovery"
                    pick="teamContext"
                  />
                )}
                {preset.skills.map((skill) => (
                  <PieceRow
                    key={skill.skill_name}
                    organizationId={organizationId}
                    name={skill.skill_name}
                    detail={[MODE_LABELS[skill.mode], skill.description].filter(Boolean).join(' · ')}
                    tokens={skill.content?.approx_tokens ?? null}
                    sha256={skill.content?.sha256 ?? null}
                    skillName={skill.content ? skill.skill_name : null}
                    pick="content"
                  />
                ))}
              </Table.Body>
            </Table.Root>
            <p className="text-xs text-neutral-subtle">
              Qovery skills not listed here follow the starting point above, with the team context. Opening a piece here
              is recorded in the audit logs as a view; it does not count as an agent load. Say “show Qovery preset” to
              your agent to see the same text there.
            </p>
          </>
        )}
      </Section>

      {manifest && (
        <Section
          aria-labelledby="member-budget-title"
          className="flex flex-col gap-3 rounded-md border border-neutral p-4"
        >
          <Heading level={2} id="member-budget-title">
            What it costs your agent in context
          </Heading>
          <TokenBudgetView budget={computeTokenBudgetFromManifest(manifest)} />
        </Section>
      )}
    </div>
  )
}
