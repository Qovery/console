import type { Meta } from '@storybook/react'
import Terminal from './terminal'

const Story: Meta<typeof Terminal> = {
  component: Terminal,
  title: 'Terminal',
  decorators: [
    (Story) => (
      <div style={{ background: 'white', padding: '3em' }}>
        <Story />
      </div>
    ),
  ],
}

export const Primary = {
  args: {},
}

export default Story
