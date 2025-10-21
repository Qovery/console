import type { Meta, StoryFn } from '@storybook/react-webpack5'
import { LoaderDots } from './loader-dots'

export default {
  component: LoaderDots,
  title: 'LoaderDots',
  argTypes: {},
} as Meta<typeof LoaderDots>

const Template: StoryFn<typeof LoaderDots> = (args) => <LoaderDots {...args} />

export const Primary = Template.bind({})
Primary.args = {
  className: '',
}
