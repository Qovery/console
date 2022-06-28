import { select } from '@storybook/addon-knobs'
import { Meta, Story } from '@storybook/react'
import { CopyToClipboardProps, CopyToClipboard, CopyToClipboardLayout } from './copy-to-clipboard'

export default {
  component: CopyToClipboard,
  title: 'Copy To Clipboard',
} as Meta

const Template: Story<CopyToClipboardProps> = (args) => <CopyToClipboard {...args} />

export const Primary = Template.bind({})
Primary.args = {
  layout: select('Layout', CopyToClipboardLayout, CopyToClipboardLayout.NORMAL),
  content: 'text to copy',
}
