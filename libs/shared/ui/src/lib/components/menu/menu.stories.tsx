import { Menu, MenuAlign, MenuDirection, MenuProps } from './menu'
import { Meta, Story } from '@storybook/react'
import Button from '../buttons/button/button'
import { select } from '@storybook/addon-knobs'
import Icon from '../icon/icon'
import { MenuItemProps } from './menu-item/menu-item'

export default {
  component: Menu,
  title: 'Menu',
} as Meta

const menus = [
  {
    items: [
      { name: 'Test 1', link: '/', contentLeft: <Icon name="icon-solid-layer-group" className="text-brand-400" /> },
      { name: 'Test 2', link: '/', contentRight: <Icon name="icon-solid-star" className="text-yellow-400 text-sm" /> },
      { name: 'Test 3', link: '/' },
    ],
    title: 'Test',
    button: 'Link',
    buttonLink: '/',
    search: true,
  },
  {
    items: [
      { name: 'Test 4', link: '/' },
      { name: 'Test 5', link: '/' },
      { name: 'Test 6', link: '/' },
    ],
  },
]

const Template: Story<MenuProps> = (args) => <Menu open={true} menus={menus} trigger={<Button>Trigger</Button>}></Menu>

export const Primary = Template.bind({})

Primary.args = {
  direction: select('Size', MenuDirection, MenuDirection.RIGHT),
  arrowAlign: select('Type', MenuAlign, MenuAlign.CENTER),
}
