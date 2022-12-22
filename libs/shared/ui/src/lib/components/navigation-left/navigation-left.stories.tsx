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
  title: 'Navigation',
  link: {
    title: 'New',
    onClick: () => console.log('on click'),
  },
  links: [
    {
      title: 'General',
      url: '/',
      icon: 'icon-solid-wheel',
    },
    {
      title: 'Deployment',
      icon: 'icon-solid-wheel',
      subLinks: [
        {
          title: 'General',
        },
        {
          title: 'Dependencies',
          url: '/',
        },
        {
          title: 'Restrictions',
        },
      ],
    },
    {
      title: 'Preview Environments',
      icon: 'icon-solid-wheel',
    },
    {
      title: 'Advanced settings',
      icon: 'icon-solid-wheel',
      subLinks: [
        {
          title: 'General',
        },
      ],
    },
  ],
}
