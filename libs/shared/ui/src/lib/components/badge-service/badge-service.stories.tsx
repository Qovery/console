import { Meta, Story } from '@storybook/react'
import { BadgeService, BadgeServiceProps } from './badge-service'

export default {
  component: BadgeService,
  title: 'BadgeService',
} as Meta

const Template: Story<BadgeServiceProps> = (args) => <BadgeService {...args} />

export const Primary = Template.bind({})
Primary.args = {
  type: 'Rémi',
}
