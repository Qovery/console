import { ComponentMeta, ComponentStory } from '@storybook/react'
import { PlaceholderSettings } from './placeholder-settings'

export default {
  component: PlaceholderSettings,
  title: 'PlaceholderSettings',
} as ComponentMeta<typeof PlaceholderSettings>

const Template: ComponentStory<typeof PlaceholderSettings> = (args) => <PlaceholderSettings {...args} />

export const Primary = Template.bind({})
Primary.args = {
  title: 'No Storage are set',
  description: 'Need help? You may find these links useful',
}
