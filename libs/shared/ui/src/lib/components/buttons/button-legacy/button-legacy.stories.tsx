import { type Meta, type Story } from '@storybook/react'
import { ButtonLegacy, type ButtonProps, ButtonSize, ButtonStyle } from './button-legacy'

export default {
  component: ButtonLegacy,
  title: 'Buttons/ButtonDefault',
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

const ButtonContent = () => {
  return <span>Button</span>
}

const Template: Story<ButtonProps> = (args) => (
  <ButtonLegacy {...args}>
    <ButtonContent />
  </ButtonLegacy>
)

export const Primary = Template.bind({})
Primary.args = {
  size: ButtonSize.REGULAR,
  style: ButtonStyle.BASIC,
  iconLeft: 'icon-solid-eye',
  iconRight: 'icon-solid-eye',
}
