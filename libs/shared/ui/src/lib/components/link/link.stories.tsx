import { Meta, Story } from '@storybook/react'
import { Link, LinkProps } from './link'

export default {
  component: Link,
  title: 'Link',
} as Meta

const Template: Story<LinkProps> = (args) => <Link {...args} />

export const Primary = Template.bind({})
Primary.args = {
  link: 'https://twitter.com/benjamincode',
  linkLabel: 'Link to an handsome developer',
  external: true,
  iconRight: 'icon-solid-arrow-up-right-from-square',
  iconLeft: '',
}
