import { ComponentStory, ComponentMeta } from '@storybook/react'
import { Dropzone } from './dropzone'

export default {
  component: Dropzone,
  title: 'Dropzone',
} as ComponentMeta<typeof Dropzone>

const Template: ComponentStory<typeof Dropzone> = (args) => <Dropzone {...args} />

export const Primary = Template.bind({})
Primary.args = {
  isDragActive: false,
  className: '',
}
