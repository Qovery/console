import { type Meta, type Story } from '@storybook/react'
import { InputCheckbox, type InputCheckboxProps } from './input-checkbox'

export default {
  component: InputCheckbox,
  title: 'Inputs/InputCheckbox',
} as Meta

const Template: Story<InputCheckboxProps> = (args) => <InputCheckbox {...args} />

export const Primary = Template.bind({})
Primary.args = {
  name: 'test',
  isChecked: true,
}
