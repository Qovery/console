import type { Meta, StoryFn } from '@storybook/react-webpack5'
import { EmptyState } from './empty-state'

export default {
  component: EmptyState,
  title: 'EmptyState',
} as Meta<typeof EmptyState>

const Template: StoryFn<typeof EmptyState> = (args) => <EmptyState {...args} />

export const Primary = Template.bind({})
Primary.args = {
  title: 'No Storage are set',
  icon: 'folder-open',
  description: 'Need help? You may find these links useful',
}

export const Small = Template.bind({})
Small.args = {
  title: 'No deployment recorded yet',
  icon: 'rocket',
  description: 'Create and deploy your first service',
  size: 'small',
}
