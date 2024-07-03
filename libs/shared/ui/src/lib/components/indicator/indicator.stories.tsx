import { type Meta, type StoryFn } from '@storybook/react'
import Button from '../button/button'
import { Indicator, type IndicatorProps } from './indicator'

export default {
  component: Indicator,
  title: 'Indicator',
} as Meta

const Template: StoryFn<IndicatorProps> = (args) => (
  <Indicator {...args} content={<div className="h-3 w-3 rounded-full bg-red-500" />}>
    <Button size="lg">Button</Button>
  </Indicator>
)

export const Primary = Template.bind({})
Primary.args = {
  side: 'top',
  align: 'end',
}
