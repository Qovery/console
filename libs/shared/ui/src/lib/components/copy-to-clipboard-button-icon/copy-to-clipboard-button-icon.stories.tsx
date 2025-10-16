import type { Meta, StoryFn } from '@storybook/react-webpack5'
import { CopyToClipboardButtonIcon, type CopyToClipboardButtonIconProps } from './copy-to-clipboard-button-icon'

export default {
  component: CopyToClipboardButtonIcon,
  title: 'Copy To Clipboard Button Icon',
} as Meta

const Template: StoryFn<CopyToClipboardButtonIconProps> = (args) => <CopyToClipboardButtonIcon {...args} />

export const Primary = Template.bind({})
Primary.args = {
  content: 'text to copy',
}
