import type { Meta } from '@storybook/react'
import { Button } from '../button/button'
import { Icon } from '../icon/icon'
import { IconAwesomeEnum } from '../icon/icon-awesome.enum'
import { DropdownMenu } from './dropdown-menu'

const Story: Meta<typeof DropdownMenu.Root> = {
  component: DropdownMenu.Root,
  title: 'DropdownMenu',
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
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button size="md" variant="outline" color="neutral">
          Trigger
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content>
          <DropdownMenu.Item>
            <Icon name={IconAwesomeEnum.PLAY} className="mr-2 text-brand-400" />
            Deploy
          </DropdownMenu.Item>
          <DropdownMenu.Item>Deploy latest version for..</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  ),
}
