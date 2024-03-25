import type { Meta } from '@storybook/react'
import Terminal from './terminal'

const Story: Meta<typeof Terminal> = {
  component: Terminal,
  title: 'Terminal',
  decorators: [
    () => (
      <div style={{ background: 'white', padding: '3em' }}>
        <Terminal onData={(terminal, data) => terminal.write(data)} />
      </div>
    ),
  ],
}

export const Primary = {
  args: {},
}

export default Story
