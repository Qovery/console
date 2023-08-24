import { type ComponentMeta, type ComponentStory } from '@storybook/react'
import { EmptyState } from './empty-state'

export default {
  component: EmptyState,
  title: 'EmptyState',
} as ComponentMeta<typeof EmptyState>

const Template: ComponentStory<typeof EmptyState> = (args) => <EmptyState {...args} />

export const Primary = Template.bind({})
Primary.args = {
  title: 'No Storage are set',
  description: 'Need help? You may find these links useful',
}
