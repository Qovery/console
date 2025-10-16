import type { Meta, StoryFn } from '@storybook/react-webpack5'
import { InputTextArea, type InputTextAreaProps } from './input-text-area'

export default {
  component: InputTextArea,
  title: 'Inputs/InputTextArea',
} as Meta

const Template: StoryFn<InputTextAreaProps> = (args) => <InputTextArea {...args} />

export const Primary = Template.bind({})
Primary.args = {
  label: 'Why do you want to use Qovery?',
  name: 'textArea',
}
