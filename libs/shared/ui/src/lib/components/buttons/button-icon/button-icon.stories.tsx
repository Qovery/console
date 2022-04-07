import { ButtonIcon, ButtonIconProps } from '@console/shared/ui'
import { select } from '@storybook/addon-knobs'
import { Meta, Story } from '@storybook/react'
import { IconEnum } from '@console/shared/enums'

export default {
  component: ButtonIcon,
  title: 'ButtonIcon',
} as Meta

const Template: Story<ButtonIconProps> = (args) => (
  <ButtonIcon {...args}></ButtonIcon>
)

export const Primary = Template.bind({})
Primary.args = {
  icon: 'icon-solid-rocket'
}
