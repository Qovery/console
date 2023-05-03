import { select } from '@storybook/addon-knobs'
import { Meta, Story } from '@storybook/react'
import { OrganizationEventType } from 'qovery-typescript-axios'
import { TagEvent, TagEventProps } from './tag-event'

export default {
  component: TagEvent,
  title: 'Tag/TagEvent',
} as Meta

const Template: Story<TagEventProps> = (args) => <TagEvent {...args} />

export const Primary = Template.bind({})

Primary.args = {
  eventType: select('Type', OrganizationEventType, OrganizationEventType.CREATE),
}
