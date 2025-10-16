import type { Meta, StoryFn } from '@storybook/react-webpack5'
import { Tag, type TagProps } from './tag'

export default {
  component: Tag,
  title: 'Tag/Default',
} as Meta

const Template: StoryFn<TagProps> = (args) => <Tag className={args.className}>{args.children}</Tag>

export const Primary = Template.bind({})

Primary.args = {
  className: 'bg-brand-50 text-brand-500',
  children: 'PROD',
}
