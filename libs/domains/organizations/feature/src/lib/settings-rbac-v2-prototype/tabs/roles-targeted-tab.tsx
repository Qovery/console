import { useParams } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Badge,
  Button,
  Checkbox,
  DropdownMenu,
  Heading,
  Icon,
  InputSelect,
  InputText,
  InputTextArea,
  Link,
  Section,
  SegmentedControl,
  Tooltip,
  useModal,
} from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import {
  CAPABILITIES,
  CAPABILITY_LEVELS,
  PERMISSION_TARGETS,
  PRESETS,
  type PermissionTarget,
  type PresetId,
  RESOURCES,
  type Resource,
  type Role,
  type RoleScope,
  TAG_KEYS,
  type TagCondition,
  capabilitiesOfPreset,
  capabilityById,
  environmentsMatchingFilters,
  matchTargetSelection,
  presetMatching,
  resourceById,
  resourcePath,
  selectedIdsOfKind,
  stageAtLeast,
} from '../rbac-v2-mock-data'
import { useRbacPrototype } from '../rbac-v2-prototype-context'
import { type TargetedPermission, V1_MIGRATIONS } from '../rbac-v2-targeted-data'
import { Panel, RESOURCE_ICONS, RoleName, TagConditionBadge } from '../rbac-v2-ui'
import { getRoleSources } from '../rbac-v2-utils'
import { OrganizationSettingsEditor } from './organization-settings-editor'

// Next (by target): "On <target> matching <selection>, the member can <capabilities of that target>". The selection
// is computed from the selected resources (the objects themselves, or what they contain or run) and the tags.

// "1 environment", "0 environments"
const count = (n: number, noun: string) => `${n} ${n === 1 ? noun : `${noun}s`}`

const TARGET_NOUN: Record<PermissionTarget, string> = {
  cluster: 'cluster',
  project: 'project',
  environment: 'environment',
}

// Visibility flows up: a permission on environments also shows their project and cluster, as context only (name and
// status, no settings and no actions). Permissions never flow down: the other environments stay hidden.
const impliedContext = (environments: Resource[]) => {
  const ids = new Set(environments.flatMap((environment) => [environment.parentId, environment.clusterId]))
  return RESOURCES.filter((resource) => ids.has(resource.id))
}

const targetOf = (target: PermissionTarget) => PERMISSION_TARGETS.find((item) => item.target === target)

function MatchSummary({ permission }: { permission: TargetedPermission }) {
  const { objects, services } = matchTargetSelection(permission.target, permission.selection)
  const kind = TARGET_NOUN[permission.target]
  return (
    <span className="text-xs text-neutral-subtle">
      {count(objects.length, kind)}
      {permission.target === 'environment' && ` · ${count(services.length, 'service')}`}
    </span>
  )
}

// The preset name when the capabilities are exactly a preset, otherwise how many were picked
function CapabilitiesBadge({ permission }: { permission: TargetedPermission }) {
  const preset = presetMatching(permission.capabilities, permission.target)
  return (
    <Tooltip
      content={
        permission.capabilities.length > 0
          ? permission.capabilities.map((id) => capabilityById(id)?.label).join(', ')
          : 'No capability'
      }
      classNameContent="max-w-sm"
    >
      <span>
        <Badge size="sm" variant="outline" color="neutral" className="font-medium">
          {preset
            ? preset.label
            : `Custom · ${permission.capabilities.length} ${permission.capabilities.length === 1 ? 'capability' : 'capabilities'}`}
        </Badge>
      </span>
    </Tooltip>
  )
}

// Selected resources by how they relate to the target, e.g. for environments: the projects they are in, the clusters
// they run on, specific environments, and specific services
const RELATIONS: Record<
  PermissionTarget,
  { kind: Resource['kind']; label: string; phrase: string; placeholder: string }[]
> = {
  cluster: [{ kind: 'cluster', label: 'Cluster is', phrase: '', placeholder: 'Select clusters' }],
  project: [{ kind: 'project', label: 'Project is', phrase: '', placeholder: 'Select projects' }],
  environment: [
    { kind: 'project', label: 'In project', phrase: 'in project', placeholder: 'Select projects' },
    { kind: 'cluster', label: 'Running on cluster', phrase: 'running on cluster', placeholder: 'Select clusters' },
    {
      kind: 'environment',
      label: 'Environment is',
      phrase: 'only',
      placeholder: 'Select environments',
    },
    {
      kind: 'service',
      label: 'Service is',
      phrase: 'only service',
      placeholder: 'Select services',
    },
  ],
}

const selectedOfKind = (selection: RoleScope, kind: Resource['kind']) =>
  selection.resourceIds.map(resourceById).filter((resource): resource is Resource => resource?.kind === kind)

// "Environments & services in project Core app, tagged env_type = prod"
export function SelectionSentence({ permission }: { permission: TargetedPermission }) {
  const allParts = RELATIONS[permission.target]
    .map((relation) => ({ relation, resources: selectedOfKind(permission.selection, relation.kind) }))
    .filter(({ resources }) => resources.length > 0)
  const parts = allParts
  const { conditions } = permission.selection
  const isEverything = allParts.length === 0 && conditions.length === 0

  const relationPart = (
    { relation, resources }: { relation: (typeof RELATIONS)[PermissionTarget][number]; resources: Resource[] },
    withComma: boolean
  ) => (
    <span key={relation.kind} className="flex items-center gap-1">
      {withComma && <span className="-ml-1 text-neutral-subtle">,</span>}
      {relation.phrase && <span className="text-neutral-subtle">{relation.phrase}</span>}
      {resources.map((resource, i) => (
        <span key={resource.id} className="flex items-center gap-1">
          {i > 0 && <span className="text-neutral-subtle">or</span>}
          <Badge size="sm" variant="surface" color="brand">
            <Icon iconName={RESOURCE_ICONS[resource.kind]} iconStyle="regular" className="mr-1" />
            {resource.kind === 'service' || resource.kind === 'environment' ? resourcePath(resource) : resource.name}
          </Badge>
        </span>
      ))}
    </span>
  )

  return (
    <span className="flex flex-wrap items-center gap-1 text-xs">
      <span className="font-medium text-neutral">
        {isEverything ? `Every ${TARGET_NOUN[permission.target]}` : targetOf(permission.target)?.label}
      </span>
      {permission.target === 'environment' && isEverything && <span className="text-neutral">and service</span>}
      {allParts.map((part, index) => relationPart(part, index > 0))}
      {conditions.length > 0 && (
        <span className={twMerge('text-neutral-subtle', parts.length > 0 && '-ml-1')}>
          {parts.length > 0 ? ', labeled' : 'labeled'}
        </span>
      )}
      {conditions.map((condition, index) => (
        <span key={`${condition.key}-${index}`} className="flex items-center gap-1">
          {index > 0 && <span className="text-neutral-subtle">and</span>}
          <TagConditionBadge condition={condition} />
        </span>
      ))}
    </span>
  )
}

export function PermissionSummary({ permission }: { permission: TargetedPermission }) {
  return (
    <li className="flex flex-wrap items-center gap-2 text-xs">
      <SelectionSentence permission={permission} />
      <Icon iconName="arrow-right" className="text-neutral-subtle" />
      <CapabilitiesBadge permission={permission} />
      <MatchSummary permission={permission} />
    </li>
  )
}

function TargetedCapabilities({
  permission,
  onChange,
}: {
  permission: TargetedPermission
  onChange: (permission: TargetedPermission) => void
}) {
  const { mode } = useRbacPrototype()
  const levels = targetOf(permission.target)?.levels ?? []
  const toggle = (id: string) =>
    onChange({
      ...permission,
      capabilities: permission.capabilities.includes(id)
        ? permission.capabilities.filter((capability) => capability !== id)
        : [...permission.capabilities, id],
    })

  return (
    <div className={twMerge('grid gap-4', levels.length > 1 ? 'grid-cols-2' : 'grid-cols-1')}>
      {CAPABILITY_LEVELS.filter(({ level }) => levels.includes(level)).map(({ level, label }) => (
        <div key={level}>
          <p className="mb-2 text-xs font-medium uppercase text-neutral-subtle">{label}</p>
          <ul className="flex flex-col gap-1.5">
            {CAPABILITIES.filter(
              (capability) => capability.level === level && stageAtLeast(mode, capability.since ?? 'mvp')
            ).map((capability) => (
              <li key={capability.id} className="flex items-center gap-2 text-xs">
                <Checkbox
                  id={`${permission.id}-${capability.id}`}
                  checked={permission.capabilities.includes(capability.id)}
                  onCheckedChange={() => toggle(capability.id)}
                />
                <label htmlFor={`${permission.id}-${capability.id}`} className="cursor-pointer text-neutral">
                  {capability.label}
                </label>
                {capability.sensitive && (
                  <Icon iconName="triangle-exclamation" iconStyle="regular" className="text-warning" />
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

// Opens in a modal, which renders outside the prototype provider: it gets the matched objects as props
function MatchesModal({
  noun,
  objects,
  services,
  context,
}: {
  noun: string
  objects: Resource[]
  services: Resource[]
  context: Resource[]
}) {
  const list = (resources: Resource[], name = false) => (
    <ul className="rounded border border-neutral bg-surface-neutral-subtle px-4 py-2">
      {resources.map((resource) => (
        <li key={resource.id} className="flex items-center py-1.5 text-sm text-neutral">
          <Icon iconName={RESOURCE_ICONS[resource.kind]} iconStyle="regular" className="mr-2 text-neutral-subtle" />
          {name ? resource.name : resourcePath(resource)}
        </li>
      ))}
    </ul>
  )

  return (
    <Section className="p-6">
      <Heading className="mb-1 text-2xl text-neutral">Matches today</Heading>
      <p className="mb-5 text-sm text-neutral-subtle">Objects added later are covered automatically.</p>
      <div className="flex flex-col gap-4">
        <div>
          <Heading level={3} className="mb-2 text-neutral">
            {count(objects.length, noun)}
          </Heading>
          {list(objects)}
        </div>
        {services.length > 0 && (
          <div>
            <Heading level={3} className="mb-2 text-neutral">
              {count(services.length, 'service')}
            </Heading>
            {list(services)}
          </div>
        )}
        {context.length > 0 && (
          <div>
            <Heading level={3} className="mb-1 text-neutral">
              Also visible as context
            </Heading>
            <p className="mb-2 text-xs text-neutral-subtle">Name and status only, no settings and no actions.</p>
            {list(context, true)}
          </div>
        )}
      </div>
    </Section>
  )
}

function TargetedPermissionEditor({
  permission,
  index,
  onChange,
  onRemove,
}: {
  permission: TargetedPermission
  index: number
  onChange: (permission: TargetedPermission) => void
  onRemove: () => void
}) {
  const [showCapabilities, setShowCapabilities] = useState(true)
  const { openModal } = useModal()
  const [removedNote, setRemovedNote] = useState<string | undefined>()
  const { isTarget } = useRbacPrototype()
  const { organizationId = '' } = useParams({ strict: false })

  // Narrow filters only keep what the broader ones still allow: environments in the selected projects, on the selected
  // clusters and matching the tags; services of those environments
  const allowedEnvironments = (selection: RoleScope) => environmentsMatchingFilters(selection)
  const allowedServices = (selection: RoleScope) => {
    const selectedEnvironments = selectedIdsOfKind(selection, 'environment')
    const environments = allowedEnvironments(selection).filter(
      (environment) => selectedEnvironments.length === 0 || selectedEnvironments.includes(environment.id)
    )
    return RESOURCES.filter(
      (resource) => resource.kind === 'service' && environments.some((e) => e.id === resource.parentId)
    )
  }

  const setSelection = (selection: RoleScope) => {
    if (permission.target !== 'environment') return onChange({ ...permission, selection })
    const environmentIds = allowedEnvironments(selection).map((resource) => resource.id)
    const keepEnvironments = selection.resourceIds.filter(
      (id) => resourceById(id)?.kind !== 'environment' || environmentIds.includes(id)
    )
    const serviceIds = allowedServices({ ...selection, resourceIds: keepEnvironments }).map((resource) => resource.id)
    const kept = keepEnvironments.filter((id) => resourceById(id)?.kind !== 'service' || serviceIds.includes(id))
    const removed = selection.resourceIds.filter((id) => !kept.includes(id)).map((id) => resourceById(id))
    setRemovedNote(
      removed.length > 0
        ? `Removed ${removed.map((resource) => resource && resourcePath(resource)).join(', ')}: no longer matches the filters above.`
        : undefined
    )
    onChange({ ...permission, selection: { ...selection, resourceIds: kept } })
  }

  const optionsOf = (kind: Resource['kind']) =>
    kind === 'environment'
      ? allowedEnvironments(permission.selection)
      : kind === 'service'
        ? allowedServices(permission.selection)
        : RESOURCES.filter((resource) => resource.kind === kind)

  // Filters added but not set yet: they show as empty rows until a value is picked
  const [pendingKinds, setPendingKinds] = useState<Resource['kind'][]>([])
  const relations = RELATIONS[permission.target]
  const resourceRows = relations.filter(
    (relation) => selectedOfKind(permission.selection, relation.kind).length > 0 || pendingKinds.includes(relation.kind)
  )
  const removeKind = (kind: Resource['kind']) => {
    setPendingKinds(pendingKinds.filter((k) => k !== kind))
    setSelection({
      ...permission.selection,
      resourceIds: permission.selection.resourceIds.filter((id) => resourceById(id)?.kind !== kind),
    })
  }
  const updateCondition = (index: number, patch: Partial<TagCondition>) =>
    setSelection({
      ...permission.selection,
      conditions: permission.selection.conditions.map((condition, i) =>
        i === index ? { ...condition, ...patch } : condition
      ),
    })

  const removeButton = (label: string, onClick: () => void) => (
    <Button type="button" variant="plain" color="neutral" size="md" iconOnly aria-label={label} onClick={onClick}>
      <Icon iconName="trash-can" iconStyle="regular" />
    </Button>
  )

  const filterRows = (
    <div className="flex flex-col gap-2">
      {resourceRows.map((relation) => (
        <div key={relation.kind} className="flex items-center gap-2">
          <span className="w-36 shrink-0 text-xs font-medium text-neutral">{relation.label}</span>
          <InputSelect
            className="flex-1"
            label={relation.label}
            isMulti
            portal
            isSearchable
            placeholder={relation.placeholder}
            value={selectedOfKind(permission.selection, relation.kind).map((resource) => resource.id)}
            onChange={(value) =>
              setSelection({
                ...permission.selection,
                resourceIds: [
                  ...permission.selection.resourceIds.filter((id) => resourceById(id)?.kind !== relation.kind),
                  ...(value as string[]),
                ],
              })
            }
            options={optionsOf(relation.kind).map((resource) => ({
              label: resourcePath(resource),
              value: resource.id,
            }))}
          />
          {removeButton(`Remove filter ${relation.label}`, () => removeKind(relation.kind))}
        </div>
      ))}
      {permission.selection.conditions.map((condition, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="w-36 shrink-0 text-xs font-medium text-neutral">With label</span>
          <InputSelect
            className="w-44"
            label="Label"
            portal
            value={condition.key}
            onChange={(value) => updateCondition(index, { key: value as string, value: '' })}
            options={TAG_KEYS.map((tag) => ({ label: tag.key, value: tag.key }))}
          />
          <InputSelect
            className="w-28"
            label="Operator"
            portal
            value={condition.operator}
            onChange={(value) => updateCondition(index, { operator: value as TagCondition['operator'] })}
            options={[{ label: '=', value: '=' }, ...(isTarget ? [{ label: '!= (NOT)', value: '!=' }] : [])]}
          />
          <InputSelect
            className="flex-1"
            label="Value"
            portal
            value={condition.value}
            onChange={(value) => updateCondition(index, { value: value as string })}
            options={(TAG_KEYS.find((tag) => tag.key === condition.key)?.values ?? []).map((value) => ({
              label: value,
              value,
            }))}
          />
          {removeButton('Remove filter With label', () =>
            setSelection({
              ...permission.selection,
              conditions: permission.selection.conditions.filter((_, i) => i !== index),
            })
          )}
        </div>
      ))}
      <div className="flex items-center gap-3">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button type="button" size="sm" variant="outline" color="neutral" className="self-start">
              <Icon iconName="plus" />
              Add filter
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="start">
            {relations.map((relation) => (
              <DropdownMenu.Item
                key={relation.kind}
                icon={<Icon iconName={RESOURCE_ICONS[relation.kind]} iconStyle="regular" />}
                disabled={resourceRows.includes(relation)}
                onSelect={() => setPendingKinds([...pendingKinds, relation.kind])}
              >
                {relation.label}
              </DropdownMenu.Item>
            ))}
            <DropdownMenu.Item
              icon={<Icon iconName="tag" iconStyle="regular" />}
              onSelect={() =>
                setSelection({
                  ...permission.selection,
                  conditions: [...permission.selection.conditions, { key: 'env_type', operator: '=', value: '' }],
                })
              }
            >
              With label
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
        {resourceRows.length === 0 && permission.selection.conditions.length === 0 && (
          <span className="text-xs text-neutral-subtle">No filter: every {TARGET_NOUN[permission.target]}.</span>
        )}
        <Link
          className="ml-auto text-xs"
          color="brand"
          size="xs"
          to="/organization/$organizationId/settings/labels"
          params={{ organizationId }}
        >
          Manage labels
          <Icon iconName="arrow-up-right" className="ml-1" />
        </Link>
      </div>
    </div>
  )
  const { objects, services } = matchTargetSelection(permission.target, permission.selection)
  const targetLabel = targetOf(permission.target)?.label.toLowerCase() ?? ''
  const noun = TARGET_NOUN[permission.target]

  return (
    <div className="rounded border border-neutral">
      <div className="flex items-center justify-between border-b border-neutral bg-surface-neutral-subtle px-4 py-2">
        <span className="text-xs font-medium text-neutral">Permission {index + 1}</span>
        <Button type="button" variant="plain" color="neutral" size="sm" onClick={onRemove}>
          <Icon iconName="trash-can" iconStyle="regular" />
          Remove permission
        </Button>
      </div>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-neutral">Define permissions for</p>
          <SegmentedControl.Root
            className="w-fit text-xs"
            value={permission.target}
            onValueChange={(value) =>
              // Capabilities belong to a target: changing it starts again from the Viewer preset
              onChange({
                ...permission,
                target: value as PermissionTarget,
                selection: { resourceIds: [], conditions: permission.selection.conditions },
                capabilities: capabilitiesOfPreset('viewer', value as PermissionTarget),
              })
            }
          >
            {PERMISSION_TARGETS.map((item) => (
              <SegmentedControl.Item key={item.target} value={item.target}>
                {item.label}
              </SegmentedControl.Item>
            ))}
          </SegmentedControl.Root>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium text-neutral">Filters</p>
          {filterRows}
          {removedNote && <p className="text-xs text-neutral-subtle">{removedNote}</p>}
          {/* The result of the filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-brand-subtle bg-surface-brand-subtle px-3 py-2">
            <SelectionSentence permission={permission} />
            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-subtle">
                Matches {count(objects.length, noun)}
                {permission.target === 'environment' && ` and ${count(services.length, 'service')}`} today
              </span>
              <Button
                type="button"
                size="xs"
                variant="plain"
                color="brand"
                disabled={objects.length === 0}
                onClick={() =>
                  openModal({
                    content: (
                      <MatchesModal
                        noun={noun}
                        objects={objects}
                        services={services}
                        context={permission.target === 'environment' ? impliedContext(objects) : []}
                      />
                    ),
                  })
                }
              >
                View
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-neutral">Permissions</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-neutral-subtle">Apply a preset</span>
            {PRESETS.map((preset) => (
              <Tooltip key={preset.id} content={preset.description}>
                <Button
                  type="button"
                  size="xs"
                  variant={
                    presetMatching(permission.capabilities, permission.target)?.id === preset.id ? 'solid' : 'outline'
                  }
                  color={
                    presetMatching(permission.capabilities, permission.target)?.id === preset.id ? 'brand' : 'neutral'
                  }
                  onClick={() =>
                    onChange({ ...permission, capabilities: capabilitiesOfPreset(preset.id, permission.target) })
                  }
                >
                  {preset.label}
                </Button>
              </Tooltip>
            ))}
            <Button
              type="button"
              className="ml-auto"
              variant="plain"
              color="neutral"
              size="xs"
              onClick={() => setShowCapabilities((show) => !show)}
            >
              <Icon iconName={showCapabilities ? 'chevron-up' : 'chevron-down'} iconStyle="regular" />
              {showCapabilities ? 'Hide capabilities' : 'Show capabilities'}
            </Button>
          </div>
        </div>
        {showCapabilities && <TargetedCapabilities permission={permission} onChange={onChange} />}
      </div>
    </div>
  )
}

function TargetedRoleEditor({
  initialRole,
  initialPermissions,
  onSave,
  onClose,
}: {
  initialRole: Role
  initialPermissions: TargetedPermission[]
  onSave: (role: Role, permissions: TargetedPermission[]) => void
  onClose: () => void
}) {
  const [role, setRole] = useState(initialRole)
  const [permissions, setPermissions] = useState(initialPermissions)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Button type="button" variant="plain" color="brand" size="sm" onClick={onClose}>
          <Icon iconName="arrow-left" />
          Back to roles
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" color="neutral" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            size="md"
            onClick={() => {
              onSave(role, permissions)
              onClose()
            }}
          >
            Save role
          </Button>
        </div>
      </div>

      <Panel title="General information">
        <div className="grid grid-cols-2 gap-4 p-4">
          <InputText
            name="role-name"
            label="Name"
            value={role.name}
            onChange={(event) => setRole({ ...role, name: event.target.value })}
          />
          <InputTextArea
            name="role-description"
            label="Description"
            value={role.description}
            onChange={(event) => setRole({ ...role, description: event.currentTarget.value })}
          />
        </div>
      </Panel>

      {V1_MIGRATIONS[role.id] && (
        <Panel
          title="Migrated from v1"
          description="This role kept the same access: each rule of the v1 role became a permission below."
        >
          <ul className="divide-y divide-neutral">
            {V1_MIGRATIONS[role.id].map((migration) => {
              const permission = permissions.find((p) => p.id === migration.permissionId)
              return (
                <li
                  key={migration.v1}
                  className="grid grid-cols-[minmax(0,2fr)_auto_minmax(0,3fr)] items-center gap-3 px-4 py-2.5"
                >
                  <span className="text-xs text-neutral">{migration.v1}</span>
                  <Icon iconName="arrow-right" className="text-neutral-subtle" />
                  {migration.implied ? (
                    <span className="flex items-center gap-1.5 text-xs text-neutral-subtle">
                      <Icon iconName="eye" iconStyle="regular" />
                      No permission needed: implied by the environment permissions
                    </span>
                  ) : permission ? (
                    <ul>
                      <PermissionSummary permission={permission} />
                    </ul>
                  ) : (
                    <span className="text-xs text-neutral-subtle">
                      {migration.permissionId ? 'Permission removed since' : 'Nothing to migrate: no access'}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </Panel>
      )}

      <Panel
        title="Organization settings"
        description="The organization settings pages this role can manage. Viewing the organization and its settings needs no capability."
      >
        <OrganizationSettingsEditor
          value={role.organizationCapabilities}
          onChange={(organizationCapabilities) => setRole({ ...role, organizationCapabilities })}
        />
      </Panel>

      <Panel
        title="Resource permissions"
        description="Each permission targets clusters, projects, or environments and their services, and grants that target's capabilities on the objects matching the selected resources and labels. Permissions add up. Members also see the project and cluster of the environments they can access, as context only."
        action={
          <Button
            type="button"
            size="md"
            variant="outline"
            color="neutral"
            onClick={() =>
              setPermissions([
                ...permissions,
                {
                  id: `t-${Date.now()}`,
                  target: 'environment',
                  selection: { resourceIds: [], conditions: [{ key: 'env_type', operator: '=', value: 'dev' }] },
                  capabilities: capabilitiesOfPreset('viewer', 'environment'),
                },
              ])
            }
          >
            <Icon iconName="plus" />
            Add permission
          </Button>
        }
      >
        <div className="flex flex-col gap-4 p-4">
          {permissions.length === 0 && <p className="text-sm text-neutral-subtle">No resource permission yet.</p>}
          {permissions.map((permission, index) => (
            <TargetedPermissionEditor
              key={permission.id}
              permission={permission}
              index={index}
              onChange={(next) => setPermissions(permissions.map((p) => (p.id === permission.id ? next : p)))}
              onRemove={() => setPermissions(permissions.filter((p) => p.id !== permission.id))}
            />
          ))}
        </div>
      </Panel>
    </div>
  )
}

export function RolesTargetedTab() {
  const { roles, assignments, groups, isTarget, hasGroups, saveRole, permissionsByRole, savePermissions } =
    useRbacPrototype()
  const [editing, setEditing] = useState<Role | undefined>()

  if (editing) {
    return (
      <TargetedRoleEditor
        key={editing.id}
        initialRole={editing}
        initialPermissions={permissionsByRole[editing.id] ?? []}
        onSave={(role, permissions) => {
          saveRole(role)
          savePermissions(role.id, permissions)
        }}
        onClose={() => setEditing(undefined)}
      />
    )
  }

  const holders = (roleId: string) => {
    const holderCount = new Set(
      [
        ...assignments.map((assignment) => assignment.principalId),
        ...groups.flatMap((group) => group.memberIds),
      ].filter((principalId) =>
        getRoleSources({ principalId, assignments, groups, isTarget, hasGroups }).some(
          (source) => source.roleId === roleId
        )
      )
    ).size
    return count(holderCount, 'holder')
  }

  // Built-in roles stay as in Next: name, description and holders, locked
  const builtInRow = (role: Role) => (
    <div key={role.id} className="flex items-center gap-4 px-4 py-3">
      <div className="flex-1">
        <p className="text-xs font-medium text-neutral">{role.name}</p>
        <p className="mt-0.5 text-xs text-neutral-subtle">{role.description}</p>
      </div>
      <span className="whitespace-nowrap text-xs text-neutral-subtle">{holders(role.id)}</span>
      <Tooltip content="Built-in roles cannot be edited">
        <span>
          <Button
            type="button"
            variant="outline"
            color="neutral"
            size="md"
            iconOnly
            disabled
            aria-label={`${role.name} cannot be edited`}
          >
            <Icon iconName="lock" iconStyle="regular" />
          </Button>
        </span>
      </Tooltip>
    </div>
  )

  // Custom roles list: name, description and holders; the permissions are in the editor
  const roleRow = (role: Role) => (
    <div key={role.id} className="flex items-center gap-4 px-4 py-3">
      <div className="flex-1">
        <RoleName role={role} />
        <p className="mt-0.5 text-xs text-neutral-subtle">{role.description}</p>
      </div>
      <span className="whitespace-nowrap text-xs text-neutral-subtle">{holders(role.id)}</span>
      <Button
        type="button"
        variant="outline"
        color="neutral"
        size="md"
        iconOnly
        aria-label={`Edit ${role.name}`}
        onClick={() => setEditing(role)}
      >
        <Icon iconName="pen" iconStyle="regular" />
      </Button>
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <Panel title="Built-in roles" description="Provided by Qovery, they cannot be edited.">
        <div className="divide-y divide-neutral">{roles.filter((role) => role.builtIn).map(builtInRow)}</div>
      </Panel>
      <Panel
        title="Custom roles"
        description="Each permission targets clusters, projects, or environments and their services."
        action={
          <Button
            size="md"
            onClick={() =>
              setEditing({
                id: `r-${Date.now()}`,
                name: 'New role',
                description: '',
                organizationCapabilities: [],
              })
            }
          >
            <Icon iconName="circle-plus" iconStyle="regular" />
            New role
          </Button>
        }
      >
        <div className="divide-y divide-neutral">{roles.filter((role) => !role.builtIn).map(roleRow)}</div>
      </Panel>
    </div>
  )
}
