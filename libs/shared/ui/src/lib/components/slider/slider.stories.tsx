import type { Meta, StoryFn } from '@storybook/react-webpack5'
import { Slider, type SliderProps } from './slider'

export default {
  component: Slider,
  title: 'inputs/Slider',
} as Meta

const Template: StoryFn<SliderProps> = (args) => <Slider {...args} />

export const Primary = Template.bind({})
Primary.args = {
  value: [100],
  min: 100,
  max: 4000,
  step: 100,
  label: 'Number of deployments needed',
  valueLabel: '/month',
  onChange: (value: number[]) => console.log(value),
}
