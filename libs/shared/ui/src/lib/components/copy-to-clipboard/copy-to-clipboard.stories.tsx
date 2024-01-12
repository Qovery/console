import type { Meta } from '@storybook/react'
import { Button } from '../button/button'
import { CopyToClipboard } from './copy-to-clipboard'

const Story: Meta<typeof CopyToClipboard> = {
  component: CopyToClipboard,
  title: 'CopyToClipboard',
  decorators: [
    (Story) => (
      <div style={{ background: 'white', padding: '3em' }}>
        <Story />
      </div>
    ),
  ],
}
export default Story

export const Primary = {
  render: () => (
    <>
      <CopyToClipboard text="foobar">
        <Button type="button" color="brand">
          Click to copy
        </Button>
      </CopyToClipboard>
      <CopyToClipboard text="foobar">
        <Button type="button" color="neutral" variant="surface" size="md">
          Click to copy
        </Button>
      </CopyToClipboard>
      <CopyToClipboard text="foobar">
        <Button type="button" color="neutral" variant="outline" size="lg">
          Click to copy
        </Button>
      </CopyToClipboard>
    </>
  ),
}
