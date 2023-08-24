import { type Meta, type Story } from '@storybook/react'
import InputRadioBox, { type InputRadioBoxProps } from './input-radio-box'

export default {
  component: InputRadioBox,
  title: 'Inputs/InputRadioBox',
} as Meta

const Template: Story<InputRadioBoxProps> = (args) => <InputRadioBox {...args} />

export const Primary = Template.bind({})
Primary.args = {
  name: 'Start',
  label: 'Start',
  fieldValue: '',
  onChange: () => {
    if (Primary.args) Primary.args.fieldValue = 'start'
  },
  value: 'start',
  description: <p data-testid="description">Description</p>,
}
