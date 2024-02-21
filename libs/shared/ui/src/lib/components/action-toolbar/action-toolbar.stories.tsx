import type { Meta } from '@storybook/react'
import { ActionToolbar } from '../action-toolbar/action-toolbar'
import { DropdownMenu } from '../dropdown-menu/dropdown-menu'
import Icon from '../icon/icon'
import { IconAwesomeEnum } from '../icon/icon-awesome.enum'

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
          <ActionToolbar.Button>
            <Icon iconName="play" className="mr-3" />
            <Icon iconName="angle-down" />
          </ActionToolbar.Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item>
            <Icon iconName="play" className="text-sm mr-3 text-brand-400" />
            Deploy
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item color="red">
            <Icon iconName="trash" className="text-sm mr-3 text-red-600" />
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
