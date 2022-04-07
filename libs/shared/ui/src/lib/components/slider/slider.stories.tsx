import { Meta, Story } from '@storybook/react'
import { Slider, SliderProps } from './slider'

export default {
  component: Slider,
  title: 'Slider',
} as Meta

const Template: Story<SliderProps> = (args) => <Slider {...args} />

export const Primary = Template.bind({})
Primary.args = {
  min: 100,
  max: 4000,
  step: 100,
  label: 'Number of deployments needed',
  valueLabel: '/month',
}
