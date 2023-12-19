import { type Meta, type Story } from '@storybook/react'
import { type ClickEvent } from '@szhsin/react-menu'
import Icon from '../../icon/icon'
import { ButtonLegacySize } from '../button-legacy/button-legacy'
import ButtonActionLegacy, { type ButtonActionLegacyProps, ButtonActionLegacyStyle } from './button-action-legacy'

export default {
  component: ButtonActionLegacy,
  title: 'Buttons/ButtonActionLegacy',
  argTypes: {
    size: {
      options: Object.values(ButtonLegacySize).filter((x) => typeof x === 'string'),
      control: { type: 'select' },
    },
    style: {
      options: Object.values(ButtonActionLegacyStyle).filter((x) => typeof x === 'string'),
      control: { type: 'select' },
    },
  },
} as Meta

const Template: Story<ButtonActionLegacyProps> = (args) => <ButtonActionLegacy {...args}>Button</ButtonActionLegacy>

const menusButton = [
  {
    items: [
      {
        name: 'Deploy',
        onClick: (e: ClickEvent) => console.log(e, 'Deploy'),
        contentLeft: <Icon name="icon-solid-play" className="text-sm text-brand-400" />,
      },
      {
        name: 'Stop',
        onClick: (e: ClickEvent) => console.log(e, 'Stop'),
        contentLeft: <Icon name="icon-solid-circle-stop" className="text-sm text-brand-400" />,
      },
    ],
  },
  {
    items: [
      {
        name: 'Redeploy',
        onClick: (e: ClickEvent) => console.log(e, 'Redeploy'),
        contentLeft: <Icon name="icon-solid-rotate-right" className="text-sm text-brand-400" />,
      },
      {
        name: 'Update applications',
        onClick: (e: ClickEvent) => console.log(e, 'Update'),
        contentLeft: <Icon name="icon-solid-rotate" className="text-sm text-brand-400" />,
      },
      {
        name: 'Rollback',
        onClick: (e: ClickEvent) => console.log(e, 'Rollblack'),
        contentLeft: <Icon name="icon-solid-clock-rotate-left" className="text-sm text-brand-400" />,
      },
    ],
  },
]

export const Primary = Template.bind({})
Primary.args = {
  style: ButtonActionLegacyStyle.BASIC,
  size: ButtonLegacySize.LARGE,
  iconRight: 'icon-solid-plus',
  menus: menusButton,
}
