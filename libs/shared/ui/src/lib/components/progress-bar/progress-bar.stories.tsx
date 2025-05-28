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
    <div className="flex w-full flex-col gap-y-14">
      <ProgressBar.Root>
        <ProgressBar.Cell percentage={60} color="var(--color-green-500)" />
        <ProgressBar.Cell percentage={30} color="var(--color-yellow-500)" />
        <ProgressBar.Cell percentage={10} color="var(--color-brand-500)" />
      </ProgressBar.Root>
      <ProgressBar.Root mode="absolute">
        <ProgressBar.Cell percentage={30} color="var(--color-green-500)" />
        <ProgressBar.Cell percentage={10} color="var(--color-brand-500)" />
      </ProgressBar.Root>
    </div>
  ),
}
