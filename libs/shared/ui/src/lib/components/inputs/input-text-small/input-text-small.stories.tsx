import { type Meta, type Story } from '@storybook/react'
import { InputTextSmall, type InputTextSmallProps } from './input-text-small'

export default {
  component: InputTextSmall,
  title: 'Inputs/InputTextSmall',
  argTypes: {
    errorMessagePosition: {
      options: ['left', 'bottom'],
      control: { type: 'select' },
    },
  },
} as Meta

const Template: Story<InputTextSmallProps> = (args) => <InputTextSmall {...args} />

export const Primary = Template.bind({})
Primary.args = {
  name: 'name',
  placeholder: 'Adding an environment name',
  errorMessagePosition: 'bottom',
  error: 'This is an error',
  type: 'password',
  hasShowPasswordButton: false,
}
