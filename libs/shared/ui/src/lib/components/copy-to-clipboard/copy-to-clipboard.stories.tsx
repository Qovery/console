import { type Meta, type Story } from '@storybook/react'
import { CopyToClipboard, type CopyToClipboardProps } from './copy-to-clipboard'

export default {
  component: CopyToClipboard,
  title: 'Copy To Clipboard',
} as Meta

const Template: Story<CopyToClipboardProps> = (args) => <CopyToClipboard {...args} />

export const Primary = Template.bind({})
Primary.args = {
  content: 'text to copy',
}
