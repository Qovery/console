import { Button, ButtonProps, ButtonSize, ButtonStyle } from './button'
import { select } from '@storybook/addon-knobs'
import { Meta, Story } from '@storybook/react'

export default {
  component: Button,
  title: 'Buttons/ButtonDefault',
} as Meta

const ButtonContent = () => {
  return <span>Button</span>
}

const Template: Story<ButtonProps> = (args) => (
  <Button {...args}>
    <ButtonContent />
  </Button>
)

export const Primary = Template.bind({})
Primary.args = {
  size: select('Size', ButtonSize, ButtonSize.REGULAR),
  style: select('Type', ButtonStyle, ButtonStyle.BASIC),
  iconLeft: 'icon-solid-eye',
  iconRight: 'icon-solid-eye',
}
