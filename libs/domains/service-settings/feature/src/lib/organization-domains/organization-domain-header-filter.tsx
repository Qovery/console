import { Button, DropdownMenu, Icon } from '@qovery/shared/ui'

interface OrganizationDomainHeaderFilterProps {
  label: string
  value: string
  options: { id: string; name: string }[]
  disabled?: boolean
  onChange: (value: string) => void
}

// The organisation API accepts one project/environment at a time; TableFilter uses multi-selection.
export function OrganizationDomainHeaderFilter({
  label,
  value,
  options,
  disabled,
  onChange,
}: OrganizationDomainHeaderFilterProps) {
  const selectedName = options.find(({ id }) => id === value)?.name
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          type="button"
          size="sm"
          variant="surface"
          color={value ? 'brand' : 'neutral'}
          className="max-w-full font-code text-xs"
          disabled={disabled}
          aria-label={`Filter by ${label.toLowerCase()}${selectedName ? `: ${selectedName}` : ''}`}
        >
          <span className="truncate">{selectedName ?? label}</span>
          <Icon iconName="chevron-down" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="max-h-80 overflow-y-auto">
        <DropdownMenu.Item className="shrink-0" onSelect={() => onChange('')}>
          <span className="mr-2 w-4 shrink-0">{!value ? <Icon iconName="check" /> : null}</span>
          All {label.toLowerCase()}s
        </DropdownMenu.Item>
        {options.map(({ id, name }) => (
          <DropdownMenu.Item key={id} className="shrink-0" onSelect={() => onChange(id)}>
            <span className="mr-2 w-4 shrink-0">{value === id ? <Icon iconName="check" /> : null}</span>
            <span className="truncate">{name}</span>
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
