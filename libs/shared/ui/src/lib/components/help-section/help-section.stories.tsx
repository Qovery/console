import { Meta, Story } from '@storybook/react'
import { HelpSection, HelpSectionProps } from './help-section'

export default {
  component: HelpSection,
  title: 'HelpSection',
} as Meta

const Template: Story<HelpSectionProps> = (args) => <HelpSection {...args} />

export const Primary = Template.bind({})
Primary.args = {
  description: 'Need help? You may find these links useful',
  links: [
    {
      link: '#',
      linkLabel: 'How to configure my application',
      external: true,
    },
    {
      link: '#',
      linkLabel: 'How to delete my application',
      external: true,
    },
  ],
}
