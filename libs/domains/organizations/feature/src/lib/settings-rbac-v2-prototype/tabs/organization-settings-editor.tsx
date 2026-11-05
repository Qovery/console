import { Button, Checkbox, Icon, Tooltip } from '@qovery/shared/ui'
import { CAPABILITIES, ORGANIZATION_AREAS, stageAtLeast } from '../rbac-v2-mock-data'
import { useRbacPrototype } from '../rbac-v2-prototype-context'

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
