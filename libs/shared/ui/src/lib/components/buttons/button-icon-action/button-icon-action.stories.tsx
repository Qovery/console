import { type Meta, type Story } from '@storybook/react'
import Icon from '../../icon/icon'
import { ButtonIconAction, type ButtonIconActionProps } from './button-icon-action'

export default {
  component: ButtonIconAction,
  title: 'Buttons/ButtonIconAction',
} as Meta

const Template: Story<ButtonIconActionProps> = (args) => <ButtonIconAction {...args}></ButtonIconAction>

export const Primary = Template.bind({})
Primary.args = {
  actions: [
    {
      triggerTooltip: 'More actions',
      iconLeft: <Icon name="icon-solid-ellipsis-v" />,
      menus: [
        {
          items: [
            {
              name: 'Deploy',
              onClick: () => console.log('Deploy'),
              contentLeft: <Icon name="icon-solid-play" className="text-sm text-brand-400" />,
            },
            {
              name: 'Stop',
              onClick: () => console.log('Stop'),
              contentLeft: <Icon name="icon-solid-circle-stop" className="text-sm text-brand-400" />,
            },
          ],
        },
      ],
    },
  ],
}
