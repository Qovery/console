import type { Meta } from '@storybook/react'
import { ActionToolbar } from '../action-toolbar/action-toolbar'
import { DropdownMenu } from '../dropdown-menu/dropdown-menu'
import Icon from '../icon/icon'

const Story: Meta<typeof ActionToolbar.Root> = {
  component: ActionToolbar.Root,
  title: 'ActionToolbar',
  decorators: [
    (Story) => (
      <div style={{ background: 'white', padding: '3em' }}>
        <Story />
      </div>
    ),
  ],
}
export default Story

export const Primary = {
  render: () => (
    <ActionToolbar.Root>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <ActionToolbar.Button color="yellow">
            <Icon iconName="play" className="mr-4" />
            <Icon iconName="chevron-down" />
          </ActionToolbar.Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item icon={<Icon iconName="play" />}>Deploy</DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item color="red" icon={<Icon iconName="trash" />}>
            Delete service
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <ActionToolbar.Button>
        <Icon iconName="scroll" />
      </ActionToolbar.Button>
      <ActionToolbar.Button>
        <Icon iconName="scroll" />
      </ActionToolbar.Button>
      <ActionToolbar.Button>
        <Icon iconName="gear" />
      </ActionToolbar.Button>
    </ActionToolbar.Root>
  ),
}

export const Brand = {
  render: () => (
    <ActionToolbar.Root>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <ActionToolbar.Button color="brand" variant="solid">
            <Icon iconName="play" className="mr-4" />
            <Icon iconName="chevron-down" />
          </ActionToolbar.Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item icon={<Icon iconName="play" />}>Deploy</DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item color="red" icon={<Icon iconName="trash" />}>
            Delete service
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <ActionToolbar.Button color="brand" variant="solid">
        <Icon iconName="scroll" />
      </ActionToolbar.Button>
      <ActionToolbar.Button color="brand" variant="solid">
        <Icon iconName="scroll" />
      </ActionToolbar.Button>
      <ActionToolbar.Button color="brand" variant="solid">
        <Icon iconName="gear" />
      </ActionToolbar.Button>
    </ActionToolbar.Root>
  ),
}
