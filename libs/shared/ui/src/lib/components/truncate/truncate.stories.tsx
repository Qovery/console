import { Truncate, TruncateProps } from './truncate'
import { Meta, Story } from '@storybook/react'

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
