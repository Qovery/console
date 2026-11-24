import { type SkillPresetAssignedTo } from 'qovery-typescript-axios'
import { Badge, Icon, Tooltip } from '@qovery/shared/ui'
import { type SkillPresetAssignees } from '../hooks/use-skill-preset-assignees/use-skill-preset-assignees'

export interface AssignmentChipsProps {
  assignedTo: SkillPresetAssignedTo
  assignees?: SkillPresetAssignees
  max?: number
}

/** Who receives a preset, as text chips: the icon is decoration, the label says the kind. */
export function AssignmentChips({ assignedTo, assignees, max = 3 }: AssignmentChipsProps) {
  const chips = [
    ...(assignedTo.organization_default
      ? [{ key: 'default', icon: 'building' as const, label: 'Organization default' }]
      : []),
    ...(assignedTo.role_ids ?? []).map((roleId) => ({
      key: `role-${roleId}`,
      icon: 'user-group' as const,
      label: `Role: ${assignees?.roles.find(({ id }) => id === roleId)?.name ?? 'Unknown role'}`,
    })),
    ...(assignedTo.user_ids ?? []).map((userId) => ({
      key: `user-${userId}`,
      icon: 'user' as const,
      label: assignees?.members.find(({ id }) => id === userId)?.name ?? 'Former member',
    })),
  ]

  if (chips.length === 0) return <span className="text-neutral-subtle">Not assigned</span>

  const visible = chips.slice(0, max)
  const hidden = chips.slice(max)

  return (
    <ul className="flex flex-wrap items-center gap-1" aria-label="Assigned to">
      {visible.map((chip) => (
        <li key={chip.key}>
          <Badge variant="surface" size="base" className="gap-1 whitespace-nowrap font-medium">
            <Icon iconName={chip.icon} iconStyle="regular" className="text-neutral-subtle" aria-hidden="true" />
            {chip.label}
          </Badge>
        </li>
      ))}
      {hidden.length > 0 && (
        <li>
          <Tooltip content={hidden.map(({ label }) => label).join(', ')}>
            <Badge
              variant="surface"
              size="base"
              className="whitespace-nowrap font-medium"
              tabIndex={0}
              onClick={(event) => event.stopPropagation()}
            >
              +{hidden.length} more
            </Badge>
          </Tooltip>
        </li>
      )}
    </ul>
  )
}
