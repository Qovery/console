import type { Meta, StoryFn } from '@storybook/react-webpack5'
import { InputRadio, type InputRadioProps } from './input-radio'

export default {
  component: InputRadio,
  title: 'Inputs/InputRadio',
} as Meta

const Template: StoryFn<InputRadioProps> = (args) => <InputRadio {...args} />

export const Primary = Template.bind({})
Primary.args = {
  name: 'test',
  description: 'Because Qovery is the best thing you have ever seen in your life brother.',
  isChecked: false,
  label: 'Choose Qovery',
  value: 'qovery',
}
