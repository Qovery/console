import { type Meta, type Story } from '@storybook/react'
import { Truncate, type TruncateProps } from './truncate'

export default {
  component: Truncate,
  title: 'Truncate',
} as Meta

const Template: Story<TruncateProps> = (args) => <Truncate {...args} />

export const Primary = Template.bind({})
Primary.args = {
  text: 'Hello World !',
  truncateLimit: 5,
}
