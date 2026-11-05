import { type IconName } from '@fortawesome/fontawesome-common-types'
import { type ReactNode } from 'react'
import { Badge, Icon, Tooltip } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import {
  type Group,
  type Principal,
  type Role,
  type RoleScope,
  type TagCondition,
  resourceById,
  resourcePath,
} from './rbac-v2-mock-data'

export function TagConditionBadge({ condition }: { condition: TagCondition }) {
  return (
    <Badge size="sm" variant="surface" color={condition.operator === '!=' ? 'red' : 'neutral'} className="font-code">
      {condition.key}
      {condition.operator === '!=' ? ' != ' : ' = '}
      {condition.value}
    </Badge>
  )
}

// Resources (any of them) AND tag conditions (all of them), e.g. "Core app AND env_type = dev"
export function ScopeLabel({ scope }: { scope: RoleScope }) {
  if (scope.resourceIds.length === 0 && scope.conditions.length === 0) {
    return <span className="text-neutral-subtle">Every resource</span>
  }

  const resources = scope.resourceIds.map(resourceById).filter((resource) => resource !== undefined)

  return (
    <span className="flex flex-wrap items-center gap-1">
      {resources.map((resource, index) => (
        <span key={resource.id} className="flex items-center gap-1">
          {index > 0 && <span className="text-xs font-medium text-neutral-subtle">OR</span>}
          <Badge size="sm" variant="surface" color="brand">
            <Icon iconName={RESOURCE_ICONS[resource.kind]} iconStyle="regular" className="mr-1" />
            {resourcePath(resource)}
          </Badge>
        </span>
      ))}
      {scope.conditions.map((condition, index) => (
        <span key={`${condition.key}-${index}`} className="flex items-center gap-1">
          {(resources.length > 0 || index > 0) && <span className="text-xs font-medium text-neutral-subtle">AND</span>}
          <TagConditionBadge condition={condition} />
        </span>
      ))}
    </span>
  )
}

// Same icon wherever a group is shown: synced from the IdP, or created in Qovery
export const groupIcon = (group: Group): IconName => (group.source === 'idp' ? 'id-badge' : 'users')

export const RESOURCE_ICONS: Record<string, IconName> = {
  cluster: 'cloud',
  project: 'folder',
  environment: 'layer-group',
  service: 'cube',
}

const PRINCIPAL_ICONS: Record<Principal['kind'], IconName> = {
  user: 'user',
  'service-account': 'gear',
  agent: 'robot',
}

export function PrincipalAvatar({ principal, size = 'md' }: { principal: Principal; size?: 'sm' | 'md' }) {
  const initials = principal.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <span
      className={twMerge(
        'flex shrink-0 items-center justify-center rounded-full border border-neutral bg-surface-neutral-subtle font-medium text-neutral-subtle',
        size === 'md' ? 'h-8 w-8 text-xs' : 'h-6 w-6 text-2xs'
      )}
    >
      {principal.kind === 'user' ? initials : <Icon iconName={PRINCIPAL_ICONS[principal.kind]} iconStyle="regular" />}
    </span>
  )
}

export function RoleName({ role }: { role: Role }) {
  return (
    <span className="flex items-center gap-2">
      <span className="font-medium text-neutral">{role.name}</span>
      {role.builtIn && (
        <Badge size="sm" variant="surface" color="neutral">
          Built-in
        </Badge>
      )}
      {role.migratedFromV1 && (
        <Tooltip content="Converted automatically from a v1 custom role, with the same access">
          <span>
            <Badge size="sm" variant="surface" color="yellow">
              Migrated from v1
            </Badge>
          </span>
        </Tooltip>
      )}
    </span>
  )
}

export function Panel({
  title,
  description,
  action,
  children,
  className,
}: {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={twMerge('rounded-lg border border-neutral bg-surface-neutral', className)}>
      <header className="flex items-start justify-between gap-4 border-b border-neutral px-4 py-3">
        <div>
          <h3 className="text-sm font-medium text-neutral">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-neutral-subtle">{description}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  )
}
