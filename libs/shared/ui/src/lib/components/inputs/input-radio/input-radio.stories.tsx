import { Meta, Story } from '@storybook/react'
import { InputRadio, InputRadioProps } from './input-radio'

export default {
  component: InputRadio,
  title: 'Inputs/InputRadio'
} as Meta

const Template: Story<InputRadioProps> = (args) => <InputRadio {...args} />



export const Primary = Template.bind({})
Primary.args = {
  name: 'test',
  isChecked: false,
  label: 'Choose Qovery',
  value: 'qovery'
}
