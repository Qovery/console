import { type Meta, type Story } from '@storybook/react'
import { ButtonIcon, type ButtonIconProps } from '../button-icon/button-icon'
import { ButtonLegacySize, ButtonLegacyStyle } from '../button-legacy/button-legacy'

export default {
  component: ButtonIcon,
  title: 'Buttons/ButtonIcon',
  argTypes: {
    size: {
      options: Object.values(ButtonLegacySize).filter((x) => typeof x === 'string'),
      control: { type: 'select' },
    },
    style: {
      options: Object.values(ButtonLegacyStyle).filter((x) => typeof x === 'string'),
      control: { type: 'select' },
    },
  },
} as Meta

const Template: Story<ButtonIconProps> = (args) => <ButtonIcon {...args}></ButtonIcon>

export const Primary = Template.bind({})
Primary.args = {
  icon: 'icon-solid-rocket',
}
