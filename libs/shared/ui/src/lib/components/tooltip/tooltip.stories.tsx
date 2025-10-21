import type { Meta, StoryFn } from '@storybook/react-webpack5'
import { Tooltip, type TooltipProps } from './tooltip'

export default {
  component: Tooltip,
  title: 'Tooltip',
} as Meta

const Template: StoryFn<TooltipProps> = (args) => (
  <Tooltip {...args}>
    <span>hello</span>
  </Tooltip>
)

export const Primary = Template.bind({})
Primary.args = {
  content: <p>Hello World!</p>,
  side: 'bottom',
  align: 'center',
}
