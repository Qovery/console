import { Menu, MenuAlign, MenuData, MenuDirection, MenuProps } from './menu'
import { Meta, Story } from '@storybook/react'
import Button from '../buttons/button/button'
import { select } from '@storybook/addon-knobs'
import Icon from '../icon/icon'

export default {
  component: Menu,
  title: 'Menu',
} as Meta

const menus: MenuData = [
  {
    items: [
      {
        name: 'Test 1',
        link: { url: '/', external: false },
        contentLeft: <Icon name="icon-solid-layer-group" className="text-brand-400" />,
      },
      {
        name: 'Test 2',
        link: { url: '/', external: false },
        contentRight: <Icon name="icon-solid-star" className="text-yellow-400 text-sm" />,
      },
      { name: 'Test 3', link: { url: '/', external: false } },
    ],
    title: 'Test',
    button: 'Link',
    buttonLink: '/',
    search: true,
  },
  {
    items: [
      { name: 'Test 4', link: { url: '/', external: false } },
      { name: 'Test 5', link: { url: '/', external: false } },
      { name: 'Test 6', link: { url: '/', external: false } },
    ],
  },
]

const Template: Story<MenuProps> = (args) => <Menu open={true} menus={menus} trigger={<Button>Trigger</Button>}></Menu>

export const Primary = Template.bind({})

Primary.args = {
  direction: select('Size', MenuDirection, MenuDirection.RIGHT),
  arrowAlign: select('Type', MenuAlign, MenuAlign.CENTER),
}
