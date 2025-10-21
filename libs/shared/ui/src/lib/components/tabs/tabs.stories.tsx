import type { Meta, StoryFn } from '@storybook/react-webpack5'
import Icon from '../icon/icon'
import { Tabs, type TabsProps } from './tabs'

export default {
  component: Tabs,
  title: 'Tabs',
} as Meta

const Template: StoryFn<TabsProps> = (args) => <Tabs {...args} />

export const Primary = Template.bind({})
Primary.args = {
  items: [
    {
      name: 'Item 1',
      active: true,
      icon: <Icon name="icon-solid-wheel" />,
      link: '',
    },
    {
      name: 'Item 2',
      icon: <Icon name="icon-solid-layer-group" />,
      link: '',
    },
    {
      name: 'Item 3',
      icon: <Icon name="icon-solid-globe" />,
      link: '',
    },
  ],
}
