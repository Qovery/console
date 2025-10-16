import type { Meta, StoryFn } from '@storybook/react-webpack5'
import { InputFile, type InputFileProps } from './input-file'

export default {
  component: InputFile,
  title: 'Inputs/InputFile',
} as Meta

const Template: StoryFn<InputFileProps> = (args) => <InputFile {...args} />

export const Primary = Template.bind({})
Primary.args = {
  value: undefined,
}
