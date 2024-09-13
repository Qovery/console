import { type Meta } from '@storybook/react'
import { NavigationLeft } from './navigation-left'

const Story: Meta<typeof NavigationLeft> = {
  component: NavigationLeft,
  title: 'NavigationLeft',
  parameters: {
    backgrounds: {
      default: 'white',
      values: [{ name: 'white', value: '#fff' }],
    },
  },
} as Meta

export const Primary = {
  args: {
    title: 'Navigation',
    link: {
      title: 'New',
      onClick: () => console.log('on click'),
    },
    links: [
      {
        title: 'General',
        url: '/general',
        icon: 'icon-solid-wheel',
      },
      {
        title: 'Deployment',
        icon: 'icon-solid-wheel',
        subLinks: [
          {
            title: 'General',
            url: '/deployment-general',
          },
          {
            title: 'Dependencies',
            url: '/dependencies',
          },
          {
            title: 'Restrictions',
            badge: 'beta',
            url: '/restrictions',
          },
        ],
      },
      {
        title: 'Preview Environments',
        icon: 'icon-solid-wheel',
        url: '/preview-env',
      },
      {
        title: 'Advanced settings',
        icon: 'icon-solid-wheel',
        subLinks: [
          {
            title: 'General',
            url: '/advanced-settings-general',
          },
        ],
      },
    ],
  },
}

export default Story
