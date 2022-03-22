import { Avatar, AvatarProps } from './avatar'
import { select } from '@storybook/addon-knobs'
import { Meta, Story } from '@storybook/react'
import { IconEnum } from '@console/shared/enums'

export default {
  component: Avatar,
  title: 'Avatar',
} as Meta

const Template: Story<AvatarProps> = (args) => (
  <Avatar {...args}></Avatar>
)

export const Primary = Template.bind({})
Primary.args = {
  url: 'https://avatars.githubusercontent.com/u/33811490?v=4'
}
