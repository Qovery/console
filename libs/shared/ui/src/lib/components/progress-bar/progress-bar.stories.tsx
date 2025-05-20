import type { Meta, StoryObj } from '@storybook/react'
import { ProgressBar } from './progress-bar'

const Story: Meta<typeof ProgressBar.Root> = {
  component: ProgressBar.Root,
  title: 'ProgressBar',
  decorators: [
    (Story) => (
      <div style={{ background: 'white', padding: '3em', maxWidth: '600px' }}>
        <Story />
      </div>
    ),
  ],
}
export default Story

export const Default: StoryObj<typeof ProgressBar.Root> = {
  render: () => (
    <ProgressBar.Root>
      <ProgressBar.Cell percentage={60} color="#10b981" />
      <ProgressBar.Cell percentage={30} color="#22c55e" />
      <ProgressBar.Cell percentage={10} color="#fbbf24" />
    </ProgressBar.Root>
  ),
}
