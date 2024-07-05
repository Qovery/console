import type { Meta } from '@storybook/react'
import { Icon } from '../icon/icon'
import { Avatar } from './avatar'

const Story: Meta<typeof Avatar> = {
  component: Avatar,
  title: 'Avatar',
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
    className: 'bg-neutral-100',
    fallback: <Icon name="SERVICES" />,
  },
}

export const Border = {
  args: {
    className: 'bg-neutral-100',
    border: 'solid',
    fallback: <Icon name="SERVICES" />,
  },
}

export default Story
