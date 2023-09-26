import { type Meta, type StoryObj } from '@storybook/react'
import ButtonLegacy from '../buttons/button-legacy/button-legacy'
import Icon from '../icon/icon'
import { Menu, MenuAlign, type MenuData, MenuDirection } from './menu'

const meta: Meta<typeof Menu> = {
  component: Menu,
  title: 'Menu',
}

export default meta

type Story = StoryObj<typeof Menu>

const menus: MenuData = [
  {
    items: [
      {
        name: 'Test 1',
        link: { url: '/', external: false },
        contentLeft: <Icon name="icon-solid-layer-group" className="text-brand-400 dark:text-brand-300" />,
      },
      {
        name: 'Test 2',
        link: { url: '/', external: false },
        contentRight: <Icon name="icon-solid-star" className="text-yellow-400 text-sm" />,
        copy: 'Whatever you want',
        copyTooltip: 'Copy the name',
      },
      { name: 'Test 3', link: { url: '/', external: false }, copy: 'Test 3' },
    ],
    title: 'Test',
    search: true,
    button: {
      label: 'Create',
      onClick: () => {
        alert('Create')
      },
    },
  },
  {
    items: [
      { name: 'Test 4', link: { url: '/', external: false } },
      { name: 'Test 5', link: { url: '/', external: false } },
      { name: 'Test 6', link: { url: '/', external: false } },
    ],
  },
]

export const Primary: Story = {
  args: {
    open: true,
    menus,
    trigger: <ButtonLegacy>Trigger</ButtonLegacy>,
    direction: MenuDirection.RIGHT,
    arrowAlign: MenuAlign.CENTER,
  },
}
