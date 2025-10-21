import type { Meta, StoryFn } from '@storybook/react-webpack5'
import { Dropzone } from './dropzone'

export default {
  component: Dropzone,
  title: 'Dropzone',
} as Meta<typeof Dropzone>

const Template: StoryFn<typeof Dropzone> = (args) => <Dropzone {...args} />

export const Primary = Template.bind({})
Primary.args = {
  isDragActive: false,
  className: '',
}
