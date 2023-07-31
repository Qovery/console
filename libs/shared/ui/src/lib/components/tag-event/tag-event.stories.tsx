import { Meta, StoryObj } from '@storybook/react'
import { OrganizationEventType } from 'qovery-typescript-axios'
import { TagEvent } from './tag-event'

const meta: Meta<typeof TagEvent> = {
  component: TagEvent,
  title: 'Tag/TagEvent',
}

export default meta

type Story = StoryObj<typeof TagEvent>

export const Primary: Story = {
  args: {
    eventType: OrganizationEventType.CREATE,
  },
}
