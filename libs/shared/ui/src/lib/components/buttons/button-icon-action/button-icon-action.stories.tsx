import { Icon } from '@console/shared/ui'
import { Meta, Story } from '@storybook/react'
import { ButtonIconAction, ButtonIconActionProps } from './button-icon-action'

export default {
  component: ButtonIconAction,
  title: 'Buttons/ButtonIconAction',
} as Meta

const Template: Story<ButtonIconActionProps> = (args) => <ButtonIconAction {...args}></ButtonIconAction>

export const Primary = Template.bind({})
Primary.args = {
  actions: [
    {
      iconLeft: <Icon name="icon-solid-play" />,
      iconRight: <Icon name="icon-solid-angle-down" />,
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
      menusClassName: 'border-r border-r-element-light-lighter-500',
    },
    {
      iconLeft: <Icon name="icon-solid-scroll" />,
      onClick: () => alert('on click'),
    },
    {
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
