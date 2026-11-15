import { type SkillPresetManifestSkill } from '@qovery/domains/skill-presets/data-access'
import { Badge, Callout, Heading, Icon, LoaderSpinner, TablePrimitives, Tooltip } from '@qovery/shared/ui'
import { useResolvedSkillPreset } from '../hooks/use-resolved-skill-preset/use-resolved-skill-preset'
import { baseLabel } from '../utils/qovery-skills'
import { RESOLUTION_SOURCE_LABELS } from '../utils/resolve-preset'
import { formatTokens } from '../utils/token-budget'

const { Table } = TablePrimitives

const MODE_LABELS: Record<SkillPresetManifestSkill['mode'], string> = {
  ADD: 'Organization skill',
  OVERLAY: 'Qovery skill + team instructions',
  REPLACE: 'Replaced by your organization',
  DISABLE: 'Never loaded',
}

/** Read-only view for members: what their own agent receives, from the same manifest the agent reads. */
export function MemberAgentView({ organizationId }: { organizationId: string }) {
  const { data: manifest, isLoading, error } = useResolvedSkillPreset({ organizationId })

  return (
    <div className="flex max-w-content-with-navigation-left flex-col gap-6">
      <Callout.Root color="neutral">
        <Callout.Icon>
          <Icon iconName="lock" iconStyle="regular" />
        </Callout.Icon>
        <Callout.Text>
          <Callout.TextHeading>Only admins can change skill presets</Callout.TextHeading>
          <Callout.TextDescription>
            Here is what your own agent receives. Ask an organization admin if something looks wrong.
          </Callout.TextDescription>
        </Callout.Text>
      </Callout.Root>

      <section aria-labelledby="member-agent-title" className="flex flex-col gap-3">
        <Heading level={2} id="member-agent-title">
          What your agent receives
        </Heading>
        {isLoading && <LoaderSpinner />}
        {error ? <p className="text-sm text-negative">Your preset could not be loaded. Try again later.</p> : null}
        {manifest && !manifest.skill_preset && (
          <p className="text-sm text-neutral-subtle">
            No preset applies to you: your agent uses the Qovery skills as published.
          </p>
        )}
        {manifest?.skill_preset && (
          <>
            <p className="flex flex-wrap items-center gap-2 text-sm text-neutral">
              <span className="font-medium">{manifest.skill_preset.name}</span>
              <Badge variant="surface">Revision {manifest.skill_preset.revision}</Badge>
              <Badge variant="outline">{baseLabel(manifest.skill_preset.base)}</Badge>
              <span className="text-neutral-subtle">{RESOLUTION_SOURCE_LABELS[manifest.source]}</span>
            </p>
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Skill</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>What it does</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="text-right">Size</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>SHA-256</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {manifest.skill_preset.team_context && (
                  <Table.Row>
                    <Table.Cell className="font-medium">Team context</Table.Cell>
                    <Table.Cell className="text-neutral-subtle">Sent with every skill your agent loads</Table.Cell>
                    <Table.Cell className="text-right tabular-nums">
                      {formatTokens(manifest.skill_preset.team_context.approx_tokens)} tokens
                    </Table.Cell>
                    <Table.Cell>
                      <Tooltip content={manifest.skill_preset.team_context.sha256}>
                        <span tabIndex={0} className="font-code text-xs">
                          {manifest.skill_preset.team_context.sha256.slice(0, 12)}
                        </span>
                      </Tooltip>
                    </Table.Cell>
                  </Table.Row>
                )}
                {manifest.skill_preset.skills.map((skill) => (
                  <Table.Row key={skill.skill_name}>
                    <Table.Cell className="font-code">{skill.skill_name}</Table.Cell>
                    <Table.Cell className="text-neutral-subtle">
                      {MODE_LABELS[skill.mode]}
                      {skill.description && <span className="block text-xs">{skill.description}</span>}
                    </Table.Cell>
                    <Table.Cell className="text-right tabular-nums">
                      {skill.content ? `${formatTokens(skill.content.approx_tokens)} tokens` : 'None'}
                    </Table.Cell>
                    <Table.Cell>
                      {skill.content ? (
                        <Tooltip content={skill.content.sha256}>
                          <span tabIndex={0} className="font-code text-xs">
                            {skill.content.sha256.slice(0, 12)}
                          </span>
                        </Tooltip>
                      ) : (
                        <span className="text-neutral-subtle">None</span>
                      )}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
            <p className="text-xs text-neutral-subtle">
              Say “show Qovery preset” to your agent to read any of these in full. The hashes match what your agent
              loads and what the audit logs record.
            </p>
          </>
        )}
      </section>
    </div>
  )
}
