import type { Meta } from '@storybook/react'
import { Command } from './command-menu'

const Story: Meta<typeof Command.Root> = {
  component: Command.Root,
  title: 'Command Menu',
  decorators: [
    () => (
      <div style={{ background: 'white', padding: '3em' }}>
        <Command.Root>
          <Command.Input />
        </Command.Root>
      </div>
    ),
  ],
}

export const Primary = {
  args: {
    // children: 'Foobar',
  },
}

export default Story
