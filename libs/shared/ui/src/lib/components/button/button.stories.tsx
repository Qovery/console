import { Button, ButtonProps, ButtonSize, ButtonType } from './button'
import { select } from '@storybook/addon-knobs'
import { Color } from '../../enums/colors.enum'
import { Meta, Story } from '@storybook/react'
import { IconEnum } from '../../enums/icon.enum'

export default {
  component: Button,
  title: 'Button',
} as Meta

const ButtonContent = () => {
  return <span>Button</span>
}

const Template: Story<ButtonProps> = (args) => (
  <Button {...args}>
    <ButtonContent></ButtonContent>
  </Button>
)

export const Primary = Template.bind({})
Primary.args = {
  size: select('Size', ButtonSize, ButtonSize.NORMAL),
  type: select('Type', ButtonType, ButtonType.FLAT),
  color: select('Color', Color, Color.VIOLET),
  iconLeft: select('Icon Left', IconEnum, undefined),
  iconRight: select('Color', IconEnum, undefined),
}
