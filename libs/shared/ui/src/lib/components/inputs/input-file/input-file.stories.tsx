import { Meta, Story } from '@storybook/react'
import { InputFile, InputFileProps } from './input-file'

export default {
  component: InputFile,
  title: 'Inputs/InputFile',
} as Meta

const Template: Story<InputFileProps> = (args) => <InputFile {...args} />

export const Primary = Template.bind({})
Primary.args = {
  value: undefined,
}
