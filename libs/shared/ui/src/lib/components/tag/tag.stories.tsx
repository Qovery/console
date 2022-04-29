import { Tag, TagProps } from './tag'
import { Meta, Story } from '@storybook/react'

export default {
  component: Tag,
  title: 'Tag/Default',
} as Meta

const Template: Story<TagProps> = (args) => <Tag className={args.className}>{args.children}</Tag>

export const Primary = Template.bind({})

Primary.args = {
  className: 'bg-brand-50 text-brand-500',
  children: 'PROD',
}
