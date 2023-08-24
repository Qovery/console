import { type Meta, type Story } from '@storybook/react'
import { IconEnum } from '@qovery/shared/enums'
import { Avatar, type AvatarProps } from './avatar'

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
