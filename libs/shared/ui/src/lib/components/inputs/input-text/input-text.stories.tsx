import { Meta, Story } from '@storybook/react'
import CopyToClipboard from '../../copy-to-clipboard/copy-to-clipboard'
import { InputText, InputTextProps } from './input-text'

export default {
  component: InputText,
  title: 'Inputs/InputText',
} as Meta

const Template: Story<InputTextProps> = (args) => <InputText {...args} />

const defaultProps: InputTextProps = {
  label: 'First name',
  name: 'firstName',
  rightElement: null,
  disabled: false,
  type: 'text',
}

export const Primary = Template.bind({})
Primary.args = {
  ...defaultProps,
}

export const Time = Template.bind({})
Time.args = {
  ...defaultProps,
  type: 'time',
}

const TemplateWithRightElement: Story<InputTextProps> = (args) => <InputText {...args} />

export const WithRightElement = Template.bind({})
WithRightElement.args = {
  ...defaultProps,
  rightElement: <CopyToClipboard content="Copy to clipboard" />,
}
