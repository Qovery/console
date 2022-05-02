import { ButtonAction, ButtonActionProps, ButtonActionStyle, Icon } from '@console/shared/ui'
import { Meta, Story } from '@storybook/react'
import { ClickEvent } from '@szhsin/react-menu'

export default {
  component: ButtonAction,
  title: 'Buttons/ButtonAction',
} as Meta

const Template: Story<ButtonActionProps> = (args) => <ButtonAction {...args}>Button</ButtonAction>

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
  style: ButtonActionStyle.BASIC,
  iconRight: 'icon-solid-plus',
  menus: menusButton,
}
