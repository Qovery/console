import type { Meta, StoryFn } from '@storybook/react-webpack5'
import CopyToClipboardButtonIcon from '../../copy-to-clipboard-button-icon/copy-to-clipboard-button-icon'
import { InputText, type InputTextProps } from './input-text'

export default {
  component: InputText,
  title: 'Inputs/InputText',
} as Meta

const Template: StoryFn<InputTextProps> = (args) => <InputText {...args} />

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

export const WithRightElement = Template.bind({})
WithRightElement.args = {
  ...defaultProps,
  rightElement: <CopyToClipboardButtonIcon content="Copy to clipboard" />,
}
