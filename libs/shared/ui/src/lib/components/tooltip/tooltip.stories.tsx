import { Tooltip, TooltipProps } from './tooltip'
import { Meta, Story } from '@storybook/react'

export default {
  component: Tooltip,
  title: 'Tooltip',
} as Meta

const Template: Story<TooltipProps> = (args) => (
  <Tooltip {...args}>
    <span>Hover me!</span>
  </Tooltip>
)

export const Primary = Template.bind({})
Primary.args = {
  content: <p>Hello World!</p>,
  side: 'bottom',
  align: 'center',
}
