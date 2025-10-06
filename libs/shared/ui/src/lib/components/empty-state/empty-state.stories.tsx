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
  description: 'Need help? You may find these links useful',
}
