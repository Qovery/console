import type { Meta, StoryFn } from '@storybook/react-webpack5'
import { FunnelFlowBody } from './funnel-flow-body'

export default {
  component: FunnelFlowBody,
  title: 'FunnelFlow/FunnelFlowBody',
} as Meta<typeof FunnelFlowBody>

const Template: StoryFn<typeof FunnelFlowBody> = (args) => <FunnelFlowBody {...args} />

export const Primary = Template.bind({})
Primary.args = {}
