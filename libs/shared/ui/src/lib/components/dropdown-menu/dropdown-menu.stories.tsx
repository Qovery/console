import type { Meta } from '@storybook/react'
import { Button } from '../button/button'
import { Icon } from '../icon/icon'
import Truncate from '../truncate/truncate'
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
      <DropdownMenu.Content>
        <DropdownMenu.Item icon={<Icon iconName="play" />}>Deploy</DropdownMenu.Item>
        <DropdownMenu.Item>Deploy latest version</DropdownMenu.Item>
        <DropdownMenu.Item icon={<Icon iconName="gear" />}>
          <Truncate text="Super long text that should be truncated at some point" truncateLimit={27} />
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item color="red" icon={<Icon iconName="trash" />}>
          Delete service
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  ),
}
