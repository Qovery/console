import { Meta, Story } from '@storybook/react'
import { InputText, InputTextProps } from './input-text'

export default {
  component: InputText,
  title: 'Inputs/InputText',
} as Meta

const Template: Story<InputTextProps> = (args) => <InputText {...args} />

export const Primary = Template.bind({})
Primary.args = {
  label: 'First name',
  name: 'firstName',
  defaultValue: 'Rémi Bonnet',
  isValid: true,
}
