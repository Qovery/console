import { Button, DropdownMenu, Icon } from '@qovery/shared/ui'

export type SecretFormat = 'variable' | 'file' | 'json'

const ADD_SECRET_OPTIONS = [
  {
    value: 'variable',
    label: 'Add secret as variable',
    icon: 'key' as const,
  },
  {
    value: 'file',
    label: 'Add secret as file',
    icon: 'file-lines' as const,
  },
  {
    value: 'json',
    label: 'Add secret as JSON',
    icon: 'brackets-curly' as const,
  },
] satisfies { value: SecretFormat; label: string; icon: 'key' | 'file-lines' | 'brackets-curly' }[]

type AddSecretDropdownProps = {
  color?: 'brand' | 'neutral'
  size?: 'sm' | 'md'
  onSelect: (format: SecretFormat) => void
}

export function AddSecretDropdown({ color = 'brand', size = 'md', onSelect }: AddSecretDropdownProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button color={color} variant="solid" size={size} type="button">
          <Icon iconName="circle-plus" iconStyle="regular" />
          Add secret
          <Icon iconName="angle-down" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="w-[240px]">
        {ADD_SECRET_OPTIONS.map((option) => (
          <DropdownMenu.Item
            key={option.value}
            icon={<Icon iconName={option.icon} />}
            onSelect={() => onSelect(option.value)}
          >
            {option.label}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
