import { Meta, Story } from '@storybook/react'
import { ButtonIcon, ButtonIconProps } from '../button-icon/button-icon'
import { ButtonSize, ButtonStyle } from '../button/button'

export default {
  component: ButtonIcon,
  title: 'Buttons/ButtonIcon',
  argTypes: {
    size: {
      options: Object.values(ButtonSize).filter((x) => typeof x === 'string'),
      control: { type: 'select' },
    },
    style: {
      options: Object.values(ButtonStyle).filter((x) => typeof x === 'string'),
      control: { type: 'select' },
    },
  },
} as Meta

const Template: Story<ButtonIconProps> = (args) => <ButtonIcon {...args}></ButtonIcon>

export const Primary = Template.bind({})
Primary.args = {
  icon: 'icon-solid-rocket',
}
