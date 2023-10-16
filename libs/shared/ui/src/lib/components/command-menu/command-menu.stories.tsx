import type { Meta } from '@storybook/react'
import { Command } from './command-menu'

const Story: Meta<typeof Command.Dialog> = {
  component: Command.Dialog,
  title: 'Command Menu',
  decorators: [
    () => (
      <div>
        <Command.Dialog open={true} label="Global Command Menu">
          <Command.Input placeholder="Search" />
          <Command.List>
            <Command.Empty>No results found.</Command.Empty>

            <Command.Group heading="Letters">
              <Command.Item>a</Command.Item>
              <Command.Item>b</Command.Item>
              <Command.Separator />
              <Command.Item>c</Command.Item>
            </Command.Group>

            <Command.Item>Apple</Command.Item>
          </Command.List>
        </Command.Dialog>
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
