import { StatusMenu, StatusMenuProps, StatusMenuState } from './status-menu'
import { Meta, Story } from '@storybook/react'
import { select } from '@storybook/addon-knobs'
import { ClickEvent } from '@szhsin/react-menu'
import Icon from '../icon/icon'

export default {
  component: StatusMenu,
  title: 'Status menu',
} as Meta

const clickAction = (e: ClickEvent, action: string) => {
  console.log(e)
}

const actionsMenu = [
  {
    items: [
      {
        name: 'Deploy',
        onClick: (e: ClickEvent) => clickAction(e, 'Deploy'),
        contentLeft: <Icon name="icon-solid-play" className="text-sm text-brand-400" />,
      },
      {
        name: 'Stop',
        onClick: (e: ClickEvent) => clickAction(e, 'Stop'),
        contentLeft: <Icon name="icon-solid-circle-stop" className="text-sm text-brand-400" />,
      },
    ],
  },
  {
    items: [
      {
        name: 'Redeploy',
        onClick: (e: ClickEvent) => clickAction(e, 'Redeploy'),
        contentLeft: <Icon name="icon-solid-rotate-right" className="text-sm text-brand-400" />,
      },
      {
        name: 'Update applications',
        onClick: (e: ClickEvent) => clickAction(e, 'Update'),
        contentLeft: <Icon name="icon-solid-rotate" className="text-sm text-brand-400" />,
      },
      {
        name: 'Rollback',
        onClick: (e: ClickEvent) => clickAction(e, 'Rollblack'),
        contentLeft: <Icon name="icon-solid-clock-rotate-left" className="text-sm text-brand-400" />,
      },
    ],
  },
]

const Template: Story<StatusMenuProps> = (args) => <StatusMenu {...args} menus={actionsMenu} />

export const Primary = Template.bind({})

Primary.args = {
  status: select('Status', StatusMenuState, StatusMenuState.RUNNING),
}
