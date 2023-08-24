import { type ComponentMeta, type ComponentStory } from '@storybook/react'
import { FunnelFlowBody } from './funnel-flow-body'

export default {
  component: FunnelFlowBody,
  title: 'FunnelFlow/FunnelFlowBody',
} as ComponentMeta<typeof FunnelFlowBody>

const Template: ComponentStory<typeof FunnelFlowBody> = (args) => <FunnelFlowBody {...args} />

export const Primary = Template.bind({})
Primary.args = {}
