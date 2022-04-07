import { Menu, MenuAlign, MenuDirection, MenuProps } from './menu'
import { Meta, Story } from '@storybook/react'
import Button from '../buttons/button/button'
import { select } from '@storybook/addon-knobs'

export default {
  component: Menu,
  title: 'Menu',
} as Meta

const menus = [
  [
    { name: 'Test 1', link: '/' },
    { name: 'Test 2', link: '/' },
    { name: 'Test 3', link: '/' },
  ],
  [
    { name: 'Test 4', link: '/' },
    { name: 'Test 5', link: '/' },
    { name: 'Test 6', link: '/' },
  ],
]

const Template: Story<MenuProps> = (args) => (
  <Menu menus={menus} arrowAlign={MenuAlign.START} trigger={<Button>Trigger</Button>}></Menu>
)

export const Primary = Template.bind({
  direction: select('Size', MenuDirection, MenuDirection.RIGHT),
  arrowAlign: select('Type', MenuAlign, MenuAlign.CENTER),
})
