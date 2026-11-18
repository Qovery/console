import { Link, useParams } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { type SkillPresetResolutionSource } from '@qovery/domains/skill-presets/data-access'
import { Badge, Heading, Icon, InputSearch, Skeleton, TablePrimitives } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'
import { useSkillPresetAssignees } from '../hooks/use-skill-preset-assignees/use-skill-preset-assignees'
import { useSkillPresets } from '../hooks/use-skill-presets/use-skill-presets'
import { LoadError } from '../load-error/load-error'
import { SkillPresetsLayout } from '../skill-presets-layout/skill-presets-layout'
import { RESOLUTION_SOURCE_LABELS, isTemplate, resolvePresetFor } from '../utils/resolve-preset'

const { Table } = TablePrimitives

const SOURCE_ICONS: Record<SkillPresetResolutionSource, 'user' | 'user-group' | 'building' | 'circle-minus'> = {
  USER: 'user',
  ROLE: 'user-group',
  ORGANIZATION: 'building',
  QOVERY_DEFAULT: 'circle-minus',
}

function AssignmentsContent({ organizationId }: { organizationId: string }) {
  const { data: allPresets = [], isLoading, error, refetch } = useSkillPresets({ organizationId })
  const {
    data: assignees,
    isLoading: isAssigneesLoading,
    error: assigneesError,
  } = useSkillPresetAssignees({ organizationId })
  const [search, setSearch] = useState('')
  const presets = useMemo(() => allPresets.filter((preset) => !isTemplate(preset)), [allPresets])

  const rows = useMemo(
    () =>
      (assignees?.members ?? []).map((member) => ({
        member,
        roleName: assignees?.roles.find(({ id }) => id === member.role_id)?.name ?? 'No role',
        ...resolvePresetFor(presets, { userId: member.id, roleId: member.role_id }),
      })),
    [assignees, presets]
  )

  if (error || assigneesError) {
    return (
      <LoadError title="Assignments could not be loaded" error={error ?? assigneesError} onRetry={() => refetch()} />
    )
  }

  if (isLoading || isAssigneesLoading) {
    return <Skeleton height={240} className="w-full" show />
  }

  const organizationDefault = presets.find(({ assigned_to }) => assigned_to.organization_default)
  const query = search.trim().toLowerCase()
  const filteredRows = rows.filter(
    ({ member, roleName, preset }) =>
      !query ||
      member.name.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query) ||
      roleName.toLowerCase().includes(query) ||
      (preset?.name.toLowerCase().includes(query) ?? false)
  )
  const presetLink = (preset: { id: string; name: string } | null) =>
    preset ? (
      <Link
        to="/organization/$organizationId/agent-experience/skill-presets/$skillPresetId"
        params={{ organizationId, skillPresetId: preset.id }}
        className="font-medium text-neutral hover:text-brand"
      >
        {preset.name}
      </Link>
    ) : (
      <span className="text-neutral-subtle">Qovery skills as published</span>
    )

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="assignments-roles" className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <Heading level={2} id="assignments-roles">
            Roles and default
          </Heading>
          <p className="text-sm text-neutral-subtle">
            A member’s own preset wins over their role’s, which wins over the organization default.
          </p>
        </div>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Target</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Preset assigned</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="text-right">Members who get it</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>
                <span className="flex items-center gap-2">
                  <Icon iconName="building" iconStyle="regular" className="text-neutral-subtle" aria-hidden="true" />
                  Organization default
                </span>
              </Table.Cell>
              <Table.Cell>{presetLink(organizationDefault ?? null)}</Table.Cell>
              <Table.Cell className="text-right tabular-nums">
                {rows.filter(({ source }) => source === 'ORGANIZATION').length}
              </Table.Cell>
            </Table.Row>
            {(assignees?.roles ?? []).map((role) => {
              const preset = presets.find(({ assigned_to }) => assigned_to.role_ids.includes(role.id)) ?? null
              const members = rows.filter(({ member }) => member.role_id === role.id)
              const effective = members.filter(({ source }) => source === 'ROLE').length
              return (
                <Table.Row key={role.id}>
                  <Table.Cell>
                    <span className="flex items-center gap-2">
                      <Icon
                        iconName="user-group"
                        iconStyle="regular"
                        className="text-neutral-subtle"
                        aria-hidden="true"
                      />
                      Role: {role.name}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    {preset ? (
                      presetLink(preset)
                    ) : (
                      <span className="text-neutral-subtle">None, falls back to the default</span>
                    )}
                  </Table.Cell>
                  <Table.Cell className="text-right tabular-nums">
                    {preset ? `${effective} of ${members.length}` : <span className="text-neutral-subtle">None</span>}
                  </Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table.Root>
      </section>

      <section aria-labelledby="assignments-members" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <Heading level={2} id="assignments-members">
              Every member
            </Heading>
            <p className="text-sm text-neutral-subtle">The preset each member's agent receives today, and why.</p>
          </div>
          <InputSearch
            className="w-64"
            placeholder="Search members, roles, presets"
            ariaLabel="Search members"
            value={search}
            onChange={setSearch}
          />
        </div>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Member</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Role</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Gets</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Because</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredRows.map(({ member, roleName, preset, source }) => (
              <Table.Row key={member.id}>
                <Table.Cell className="h-auto py-2">
                  <span className="flex flex-col">
                    <span className="text-neutral">{member.name}</span>
                    <span className="text-xs text-neutral-subtle">{member.email}</span>
                  </span>
                </Table.Cell>
                <Table.Cell>{roleName}</Table.Cell>
                <Table.Cell>{presetLink(preset)}</Table.Cell>
                <Table.Cell>
                  <Badge variant="surface" className="gap-1">
                    <Icon
                      iconName={SOURCE_ICONS[source]}
                      iconStyle="regular"
                      className="text-neutral-subtle"
                      aria-hidden="true"
                    />
                    {RESOLUTION_SOURCE_LABELS[source]}
                  </Badge>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
        {filteredRows.length === 0 && <p className="text-sm text-neutral-subtle">No member matches “{search}”.</p>}
      </section>
    </div>
  )
}

export function SkillPresetAssignments() {
  const { organizationId = '' } = useParams({ strict: false })
  useDocumentTitle('Assignments - Skills Registry - Agents')
  return (
    <SkillPresetsLayout activeTab="assignments">
      <AssignmentsContent organizationId={organizationId} />
    </SkillPresetsLayout>
  )
}
