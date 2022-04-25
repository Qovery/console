import { Tag, TagProps, TagStyle } from './tag'
import { Meta, Story } from '@storybook/react'
import { select } from '@storybook/addon-knobs'

export default {
  component: Tag,
  title: 'Tag',
} as Meta

const Template: Story<TagProps> = (args) => <Tag {...args}>PROD</Tag>

export const Primary = Template.bind({})

Primary.args = {
  style: select('Style', TagStyle, TagStyle.NORMAL),
}
