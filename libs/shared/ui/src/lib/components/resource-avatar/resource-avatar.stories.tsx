import { type Meta, type StoryFn } from '@storybook/react'
import { ResourceAvatar, ResourceAvatarProps } from './resource-avatar'

export default {
  component: ResourceAvatar,
  title: 'ResourceAvatar',
} as Meta

const Template: StoryFn<ResourceAvatarProps> = (args) => <ResourceAvatar></ResourceAvatar>

export const Primary = Template.bind({})
