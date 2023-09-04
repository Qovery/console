import type { Meta } from '@storybook/react'
import { Popover } from './popover'

const Story: Meta<typeof Popover.Root> = {
  component: Popover.Root,
  title: 'Popover',
  decorators: [
    (Story) => (
      <div style={{ background: 'white', padding: '3em' }}>
        <Story />
      </div>
    ),
  ],
}
export const Primary = {
  render: () => (
    <Popover.Root>
      <Popover.Trigger>
        <span>Click Me</span>
      </Popover.Trigger>
      <Popover.Content style={{ width: 360 }}>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
          consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
          est laborum.
        </p>
      </Popover.Content>
    </Popover.Root>
  ),
}
export default Story
