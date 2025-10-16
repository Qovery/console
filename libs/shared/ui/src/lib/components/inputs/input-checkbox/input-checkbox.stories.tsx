import type { Meta, StoryFn } from '@storybook/react-webpack5'
import { InputCheckbox, type InputCheckboxProps } from './input-checkbox'

export default {
  component: InputCheckbox,
  title: 'Inputs/InputCheckbox',
} as Meta

const Template: StoryFn<InputCheckboxProps> = (args) => <InputCheckbox {...args} />

export const Primary = Template.bind({})
Primary.args = {
  name: 'test',
  isChecked: true,
}
