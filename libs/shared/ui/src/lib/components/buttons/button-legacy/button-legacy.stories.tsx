import { type Meta, type Story } from '@storybook/react'
import { ButtonLegacy, type ButtonLegacyProps, ButtonLegacySize, ButtonLegacyStyle } from './button-legacy'

export default {
  component: ButtonLegacy,
  title: 'Buttons/ButtonDefault',
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

const ButtonContent = () => {
  return <span>Button</span>
}

const Template: Story<ButtonLegacyProps> = (args) => (
  <ButtonLegacy {...args}>
    <ButtonContent />
  </ButtonLegacy>
)

export const Primary = Template.bind({})
Primary.args = {
  size: ButtonLegacySize.REGULAR,
  style: ButtonLegacyStyle.BASIC,
  iconLeft: 'icon-solid-eye',
  iconRight: 'icon-solid-eye',
}
