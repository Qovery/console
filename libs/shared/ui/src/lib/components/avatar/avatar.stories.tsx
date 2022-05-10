import { Avatar, AvatarProps } from './avatar'
import { Meta, Story } from '@storybook/react'
import { IconEnum } from '@console/shared/enums'

export default {
  component: Avatar,
  title: 'Avatar',
} as Meta

const Template: Story<AvatarProps> = (args) => <Avatar {...args}></Avatar>

export const Primary = Template.bind({})
Primary.args = {
  firstName: 'Rémi',
  lastName: 'Bonnet',
  icon: IconEnum.GITLAB,
}
