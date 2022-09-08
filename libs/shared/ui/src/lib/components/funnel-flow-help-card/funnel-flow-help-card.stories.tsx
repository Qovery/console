import { ComponentMeta, ComponentStory } from '@storybook/react'
import { FunnelFlowHelpCard } from './funnel-flow-help-card'

export default {
  component: FunnelFlowHelpCard,
  title: 'FunnelFlow/FunnelFlowHelpCard',
} as ComponentMeta<typeof FunnelFlowHelpCard>

const Template: ComponentStory<typeof FunnelFlowHelpCard> = (args) => <FunnelFlowHelpCard {...args} />

export const Primary = Template.bind({})
Primary.args = {
  title: 'What are the benefits',
  items: ['Remi is really a nice guy', 'Unfortunately for him Benjamin is even nicer'],
}
