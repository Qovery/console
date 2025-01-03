import type { Meta } from '@storybook/react'
import Icon from '../icon/icon'
import { AnimatedGradientText } from './animated-gradient-text'

const Story: Meta<typeof AnimatedGradientText> = {
  component: AnimatedGradientText,
  title: 'Text Animations/Animated Gradient Text',
}

export const Primary = {
  render: () => (
    <AnimatedGradientText
      shimmerWidth={400}
      className="inline-flex items-center justify-center gap-1 px-4 py-1 text-4xl"
    >
      <span>✨ Animated Gradient Text</span>
      <Icon iconName="arrow-right" iconStyle="regular" />
    </AnimatedGradientText>
  ),
}

export default Story
