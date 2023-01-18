import { Meta, Story } from '@storybook/react'
import InputRadioBox, { InputRadioBoxProps } from './input-radio-box'

export default {
  component: InputRadioBox,
  title: 'Inputs/InputRadioBox',
} as Meta

const Template: Story<InputRadioBoxProps> = (args) => <InputRadioBox {...args} />

export const Primary = Template.bind({})
Primary.args = {
  name: 'Start',
  field: {
    name: 'selected',
    value: '',
    onChange: () => {},
    ref: () => {},
    onBlur: () => {},
  },
  value: 'start',
  description: <p data-testid="description">Description</p>,
}

export const Selected = Template.bind({})
Selected.args = {
  name: 'Start',
  field: {
    name: 'selected',
    value: 'start',
    onChange: () => {},
    ref: () => {},
    onBlur: () => {},
  },
  value: 'start',
  description: <p data-testid="description">Description</p>,
}
