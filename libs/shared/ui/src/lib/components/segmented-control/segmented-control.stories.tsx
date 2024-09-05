import type { Meta } from '@storybook/react'
import { SegmentedControl } from './segmented-control'

const Story: Meta<typeof SegmentedControl.Root> = {
  component: SegmentedControl.Root,
  title: 'SegmentedControl',
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
    <SegmentedControl.Root defaultValue="inbox">
      <SegmentedControl.Item value="inbox">Inbox</SegmentedControl.Item>
      <SegmentedControl.Item value="drafts">Drafts</SegmentedControl.Item>
      <SegmentedControl.Item value="sent">Sent</SegmentedControl.Item>
    </SegmentedControl.Root>
  ),
}
