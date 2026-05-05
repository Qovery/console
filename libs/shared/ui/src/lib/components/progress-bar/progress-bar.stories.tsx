import type { Meta, StoryObj } from '@storybook/react-webpack5'
import { ProgressBar } from './progress-bar'

const Story: Meta<typeof ProgressBar.Root> = {
  component: ProgressBar.Root,
  title: 'ProgressBar',
  decorators: [
    (Story) => (
      <div style={{ background: 'bg-white', padding: '3em', maxWidth: '600px' }}>
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
        <ProgressBar.Cell value={60} color="var(--positive-9)" />
        <ProgressBar.Cell value={30} color="var(--warning-9)" />
        <ProgressBar.Cell value={10} color="var(--brand-9)" />
      </ProgressBar.Root>
      <ProgressBar.Root mode="absolute">
        <ProgressBar.Cell value={30} color="var(--positive-9)" />
        <ProgressBar.Cell value={10} color="var(--brand-9)" />
      </ProgressBar.Root>
    </div>
  ),
}
