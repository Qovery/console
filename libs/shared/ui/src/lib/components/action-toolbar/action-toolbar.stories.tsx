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
            <Icon name={IconAwesomeEnum.PLAY} className="mr-3" />
            <Icon name={IconAwesomeEnum.ANGLE_DOWN} />
          </ActionToolbar.Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content>
            <DropdownMenu.Arrow />
            <DropdownMenu.Item>
              <Icon name={IconAwesomeEnum.PLAY} className="text-sm mr-3 text-brand-400" />
              Deploy
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item color="red">
              <Icon name={IconAwesomeEnum.TRASH} className="text-sm mr-3 text-red-600" />
              Delete service
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <ActionToolbar.Button>
        <Icon name={IconAwesomeEnum.SCROLL} />
      </ActionToolbar.Button>
      <ActionToolbar.Button>
        <Icon name={IconAwesomeEnum.SCROLL} />
      </ActionToolbar.Button>
      <ActionToolbar.Button>
        <Icon name={IconAwesomeEnum.WHEEL} />
      </ActionToolbar.Button>
    </ActionToolbar.Root>
  ),
}
