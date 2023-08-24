import { type Meta, type Story } from '@storybook/react'
import { InputTextArea, type InputTextAreaProps } from './input-text-area'

export default {
  component: InputTextArea,
  title: 'Inputs/InputTextArea',
} as Meta

const Template: Story<InputTextAreaProps> = (args) => <InputTextArea {...args} />

export const Primary = Template.bind({})
Primary.args = {
  label: 'Why do you want to use Qovery?',
  name: 'textArea',
}
