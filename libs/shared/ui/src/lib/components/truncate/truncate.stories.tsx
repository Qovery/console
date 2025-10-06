import type { Meta, StoryFn } from '@storybook/react-webpack5'
import { Truncate, type TruncateProps } from './truncate'

export default {
  component: Truncate,
  title: 'Truncate',
} as Meta

const Template: StoryFn<TruncateProps> = (args) => <Truncate {...args} />

export const Primary = Template.bind({})
Primary.args = {
  text: 'Hello World !',
  truncateLimit: 5,
}
