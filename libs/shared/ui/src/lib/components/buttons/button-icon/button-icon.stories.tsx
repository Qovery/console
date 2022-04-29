import { Meta, Story } from '@storybook/react'
import { ButtonIcon, ButtonIconProps } from '../button-icon/button-icon'

export default {
  component: ButtonIcon,
  title: 'Buttons/ButtonIcon',
} as Meta

const Template: Story<ButtonIconProps> = (args) => <ButtonIcon {...args}></ButtonIcon>

export const Primary = Template.bind({})
Primary.args = {
  icon: 'icon-solid-rocket',
}
