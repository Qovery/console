import { type Meta, type StoryObj } from '@storybook/react-webpack5'
import { CopyButton } from './copy-button'

const meta: Meta<typeof CopyButton> = {
  component: CopyButton,
  title: 'Buttons/CopyButton',
  args: { content: 'qovery demo up' },
}
export default meta
type Story = StoryObj<typeof CopyButton>
export const Default: Story = {}
export const Terminal: Story = {
  args: {
    size: 'md',
    iconPosition: 'left',
    className: 'bg-surface-neutral-component hover:bg-surface-neutral-componentHover',
  },
  decorators: [
    (Story) => (
      <div data-theme="dark" className="rounded-lg bg-surface-neutral p-4">
        <Story />
      </div>
    ),
  ],
}
