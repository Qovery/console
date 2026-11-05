import { useParams } from '@tanstack/react-router'
import { Button, Checkbox, Icon, InputSelect, Link, Tooltip } from '@qovery/shared/ui'
import { CAPABILITIES, ORGANIZATION_AREAS, TAG_KEYS, type TagCondition, stageAtLeast } from '../rbac-v2-mock-data'
import { useRbacPrototype } from '../rbac-v2-prototype-context'

// Editors shared by the role editor: tag conditions of a permission, and the organization settings of a role

export function TagConditionsEditor({
  conditions,
  onChange,
}: {
  conditions: TagCondition[]
  onChange: (conditions: TagCondition[]) => void
}) {
  const { isTarget } = useRbacPrototype()
  const { organizationId = '' } = useParams({ strict: false })
  const update = (index: number, patch: Partial<TagCondition>) =>
    onChange(conditions.map((condition, i) => (i === index ? { ...condition, ...patch } : condition)))

  return (
    <div className="flex flex-col gap-2">
      {conditions.map((condition, index) => {
        const tagKey = TAG_KEYS.find((tag) => tag.key === condition.key)
        return (
          <div key={index} className="flex items-center gap-2">
            <span className="w-10 text-right text-xs font-medium text-neutral-subtle">{index === 0 ? '' : 'AND'}</span>
            <InputSelect
              className="w-44"
              label="Tag"
              portal
              value={condition.key}
              onChange={(value) => update(index, { key: value as string, value: '' })}
              options={TAG_KEYS.map((tag) => ({ label: tag.key, value: tag.key }))}
            />
            <InputSelect
              className="w-24"
              label="Operator"
              portal
              value={condition.operator}
              onChange={(value) => update(index, { operator: value as TagCondition['operator'] })}
              options={[{ label: '=', value: '=' }, ...(isTarget ? [{ label: '!= (NOT)', value: '!=' }] : [])]}
            />
            <InputSelect
              className="w-44"
              label="Value"
              portal
              value={condition.value}
              onChange={(value) => update(index, { value: value as string })}
              options={(tagKey?.values ?? []).map((value) => ({ label: value, value }))}
            />
            <Button
              type="button"
              variant="plain"
              color="neutral"
              size="md"
              iconOnly
              aria-label="Remove condition"
              onClick={() => onChange(conditions.filter((_, i) => i !== index))}
            >
              <Icon iconName="trash-can" iconStyle="regular" />
            </Button>
          </div>
        )
      })}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          size="sm"
          variant="outline"
          color="neutral"
          className="ml-12 self-start"
          onClick={() => onChange([...conditions, { key: 'env_type', operator: '=', value: 'prod' }])}
        >
          <Icon iconName="plus" />
          {conditions.length === 0 ? 'Add tag condition' : 'AND condition'}
        </Button>
        <Link
          className="ml-auto text-xs"
          color="brand"
          size="xs"
          to="/organization/$organizationId/settings/tags"
          params={{ organizationId }}
        >
          Manage tags
          <Icon iconName="arrow-up-right" className="ml-1" />
        </Link>
      </div>
    </div>
  )
}

// Organization settings are a section of the role, not a permission: one capability per settings page, grouped like
// the settings sidebar
export function OrganizationSettingsEditor({
  value,
  onChange,
}: {
  value: string[]
  onChange: (value: string[]) => void
}) {
  const { mode } = useRbacPrototype()
  const available = CAPABILITIES.filter(
    (capability) => capability.level === 'organization' && stageAtLeast(mode, capability.since ?? 'mvp')
  )
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          color="neutral"
          onClick={() => onChange(available.map((capability) => capability.id))}
        >
          Select all
        </Button>
        <Button type="button" size="sm" variant="plain" color="neutral" onClick={() => onChange([])}>
          Clear
        </Button>
        <span className="ml-auto text-xs text-neutral-subtle">
          {value.filter((id) => available.some((capability) => capability.id === id)).length} of {available.length}{' '}
          selected
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
        {ORGANIZATION_AREAS.map((area) => {
          const capabilities = available.filter((capability) => capability.area === area)
          return (
            capabilities.length > 0 && (
              <div key={area}>
                <p className="mb-2 text-xs font-medium uppercase text-neutral-subtle">{area}</p>
                <ul className="flex flex-col gap-1.5">
                  {capabilities.map((capability) => (
                    <li key={capability.id} className="flex items-center gap-2 text-xs">
                      <Checkbox
                        id={`org-${capability.id}`}
                        checked={value.includes(capability.id)}
                        onCheckedChange={() => toggle(capability.id)}
                      />
                      <label htmlFor={`org-${capability.id}`} className="cursor-pointer text-neutral">
                        {capability.label}
                      </label>
                      {capability.sensitive && (
                        <Tooltip content="Sensitive capability">
                          <span>
                            <Icon iconName="triangle-exclamation" iconStyle="regular" className="text-warning" />
                          </span>
                        </Tooltip>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )
          )
        })}
      </div>
    </div>
  )
}
