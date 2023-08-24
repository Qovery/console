import { type Meta, type Story } from '@storybook/react'
import { InputToggle, type InputToggleProps } from './input-toggle'

export default {
  component: InputToggle,
  title: 'Inputs/InputToggle',
} as Meta

const Template: Story<InputToggleProps> = (args) => <InputToggle {...args} />

export const Primary = Template.bind({})
