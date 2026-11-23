import { useMemo, useState } from 'react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { type SkillPresetAssignees, isOwnerRole } from '@qovery/domains/skill-presets/data-access'
import { Button, Callout, Icon, InputSelect, InputToggle } from '@qovery/shared/ui'
import { type AssignablePreset, membersReceiving } from '../utils/resolve-preset'
import { type SkillPresetFormValues } from '../utils/skill-preset-form'

export interface AssignmentSectionProps {
  draftId: string
  otherPresets: AssignablePreset[]
  assignees?: SkillPresetAssignees
  /** The 409 answer of the last save, if any. */
  conflictDetail?: string | null
}

export function AssignmentSection({ draftId, otherPresets, assignees, conflictDetail }: AssignmentSectionProps) {
  const { control } = useFormContext<SkillPresetFormValues>()
  const [organizationDefault, roleIds, userIds] = useWatch({
    control,
    name: ['organizationDefault', 'roleIds', 'userIds'],
  })
  const [showMembers, setShowMembers] = useState(false)

  const holderOf = (predicate: (preset: AssignablePreset) => boolean) => otherPresets.find(predicate)
  const defaultHolder = holderOf(({ assigned_to }) => assigned_to.organization_default)

  // The owner gets the Admin role's preset: q-core refuses Owner as a target. A preset that already
  // holds it keeps showing it, so it can be removed.
  const assignableRoles = (assignees?.roles ?? []).filter((role) => !isOwnerRole(role) || roleIds.includes(role.id))
  const roleOptions = assignableRoles.map((role) => {
    const holder = holderOf(({ assigned_to }) => assigned_to.role_ids.includes(role.id))
    return {
      value: role.id,
      label: role.name,
      isDisabled: Boolean(holder) && !roleIds.includes(role.id),
      description: holder ? `Receives ${holder.name}` : undefined,
      disabledTooltip: holder ? `Already receives ${holder.name}. Remove it there first.` : undefined,
    }
  })
  const memberOptions = (assignees?.members ?? []).map((member) => {
    const holder = holderOf(({ assigned_to }) => assigned_to.user_ids.includes(member.id))
    return {
      value: member.id,
      label: member.name,
      description: holder ? `${member.email} · receives ${holder.name}` : member.email,
      searchText: `${member.name} ${member.email}`,
      isDisabled: Boolean(holder) && !userIds.includes(member.id),
      disabledTooltip: holder ? `Already receives ${holder.name}. Remove it there first.` : undefined,
    }
  })

  const receiving = useMemo(
    () =>
      membersReceiving(
        {
          id: draftId,
          name: 'This preset',
          assigned_to: { organization_default: organizationDefault, role_ids: roleIds, user_ids: userIds },
        },
        otherPresets,
        assignees ?? { roles: [], members: [] }
      ),
    [draftId, organizationDefault, roleIds, userIds, otherPresets, assignees]
  )

  const roleName = (roleId?: string) => assignees?.roles.find(({ id }) => id === roleId)?.name ?? 'No role'
  const hasAssignment = organizationDefault || roleIds.length > 0 || userIds.length > 0

  return (
    <div className="flex flex-col gap-4">
      <Controller
        control={control}
        name="organizationDefault"
        render={({ field }) => (
          <InputToggle
            small
            value={field.value}
            onChange={field.onChange}
            disabled={Boolean(defaultHolder) && !field.value}
            title="Organization default"
            description={
              defaultHolder && !field.value
                ? `${defaultHolder.name} is the organization default. Only one preset can be, remove it there first.`
                : 'Every member without a role or member preset gets this one.'
            }
          />
        )}
      />

      <Controller
        control={control}
        name="roleIds"
        render={({ field, fieldState }) => (
          <InputSelect
            isMulti
            isSearchable
            label="Roles"
            options={roleOptions}
            value={field.value}
            onChange={(value) => field.onChange(value as string[])}
            hint="Default and custom roles, except Owner: the owner gets the Admin role's preset. A role holds one preset at a time."
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="userIds"
        render={({ field, fieldState }) => (
          <InputSelect
            isMulti
            isSearchable
            label="Members"
            options={memberOptions}
            value={field.value}
            onChange={(value) => field.onChange(value as string[])}
            hint="Overrides the member's role preset and the organization default."
            error={fieldState.error?.message}
          />
        )}
      />

      {conflictDetail && (
        <Callout.Root color="red" role="alert">
          <Callout.Icon>
            <Icon iconName="circle-exclamation" iconStyle="regular" />
          </Callout.Icon>
          <Callout.Text>
            <Callout.TextHeading>Not saved: a target already receives another preset</Callout.TextHeading>
            <Callout.TextDescription>
              {conflictDetail}. Each role, member and the organization default hold one preset at a time.
            </Callout.TextDescription>
          </Callout.Text>
        </Callout.Root>
      )}

      <div className="rounded-md border border-neutral bg-surface-neutral-subtle p-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-neutral">
            <Icon iconName="users" iconStyle="regular" className="text-neutral-subtle" aria-hidden="true" />
            {hasAssignment ? (
              <span>
                <span className="font-medium">
                  {receiving.length} {receiving.length === 1 ? 'member' : 'members'}
                </span>{' '}
                will receive this preset
              </span>
            ) : (
              <span>Not assigned: nobody receives this preset yet</span>
            )}
          </span>
          {receiving.length > 0 && (
            <Button
              type="button"
              size="xs"
              variant="plain"
              color="neutral"
              aria-expanded={showMembers}
              onClick={() => setShowMembers((value) => !value)}
            >
              {showMembers ? 'Hide members' : 'Show members'}
              <Icon iconName={showMembers ? 'chevron-up' : 'chevron-down'} iconStyle="regular" />
            </Button>
          )}
        </div>
        {showMembers && (
          <ul className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1 text-xs sm:grid-cols-2">
            {receiving.map((member) => (
              <li key={member.id} className="flex justify-between gap-2">
                <span className="truncate text-neutral">{member.name}</span>
                <span className="shrink-0 text-neutral-subtle">{roleName(member.role_id)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
