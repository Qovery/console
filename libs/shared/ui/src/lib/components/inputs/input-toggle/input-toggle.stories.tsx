import type { Meta, StoryFn } from '@storybook/react-webpack5'
import { InputToggle, type InputToggleProps } from './input-toggle'

export default {
  component: InputToggle,
  title: 'Inputs/InputToggle',
} as Meta

const Template: StoryFn<InputToggleProps> = (args) => <InputToggle {...args} />

export const Primary = Template.bind({})
