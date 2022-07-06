import { Meta, Story } from '@storybook/react'
import { NavigationLeft, NavigationLeftProps } from './navigation-left'

export default {
  component: NavigationLeft,
  title: 'NavigationLeft',
  parameters: {
    backgrounds: {
      default: 'white',
      values: [{ name: 'white', value: '#fff' }],
    },
  },
} as Meta

const Template: Story<NavigationLeftProps> = (args) => <NavigationLeft {...args} />

export const Primary = Template.bind({})

Primary.args = {
  links: [
    {
      title: 'General',
      url: '/general',
    },
    {
      title: 'Deployment',
      url: '/deployment',
    },
  ],
}
