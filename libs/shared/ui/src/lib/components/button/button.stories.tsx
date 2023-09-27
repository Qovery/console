import type { Meta } from '@storybook/react'
import { Button } from './button'

const Story: Meta<typeof Button> = {
  component: Button,
  title: 'Button',
  decorators: [
    (Story) => (
      <div style={{ background: 'white', padding: '3em' }}>
        <Story />
      </div>
    ),
  ],
}

export const Primary = {
  args: {
    children: 'Foobar',
  },
}

export default Story
