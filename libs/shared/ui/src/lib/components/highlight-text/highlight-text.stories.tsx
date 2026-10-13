import { type Meta, type StoryObj } from '@storybook/react-webpack5'
import { HighlightText } from './highlight-text'

const meta: Meta<typeof HighlightText> = {
  component: HighlightText,
  title: 'HighlightText',
  render: (args) => (
    <p className="text-sm text-neutral">
      <HighlightText {...args} />
    </p>
  ),
}

export default meta

type Story = StoryObj<typeof HighlightText>

export const Match: Story = {
  args: {
    text: 'Retention period in weeks',
    highlight: 'retention',
  },
}

export const NoMatch: Story = {
  args: {
    text: 'Retention period in weeks',
    highlight: 'storage',
  },
}

export const RepeatedMatches: Story = {
  args: {
    text: 'Log level of the logs collector',
    highlight: 'log',
  },
}
