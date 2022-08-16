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
}

export const Primary = Template.bind({})
Primary.args = {
  ...defaultProps,
}

const TemplateWithRightElement: Story<InputTextProps> = (args) => <InputText {...args} />

export const WithRightElement = Template.bind({})
WithRightElement.args = {
  ...defaultProps,
  rightElement: <CopyToClipboard content="Copy to clipboard" />,
}
