import { select } from '@storybook/addon-knobs'
import { Meta, Story } from '@storybook/react'
import Icon, { IconProps } from './icon'
import { IconEnum } from '../../enums/icon.enum'

export default {
  component: Icon,
  title: 'Icon',
} as Meta

const Template: Story<IconProps> = (args) => (
  <div>
    <span className="fa-brands fa-accessible-icon"></span>
    <span className="fa-solid fa-star"></span>
    <Icon {...args} />
  </div>
)

export const Primary = Template.bind({})
Primary.args = {
  name: select('Icon', IconEnum, IconEnum.GITHUB),
}
