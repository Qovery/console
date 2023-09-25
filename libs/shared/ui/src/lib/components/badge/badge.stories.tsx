import type { Meta } from '@storybook/react'
import { Badge } from './badge'

const Story: Meta<typeof Badge> = {
  component: Badge,
  title: 'Badge',
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
