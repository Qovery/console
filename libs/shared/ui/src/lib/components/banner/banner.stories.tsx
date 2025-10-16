import type { Meta, StoryFn } from '@storybook/react-webpack5'
import { Banner } from './banner'

export default {
  component: Banner,
  title: 'Banner',
  argTypes: {
    color: {
      control: {
        type: 'select',
      },
    },
  },
} as Meta<typeof Banner>

const children = <p>Hello Banner my old friend</p>
const Template: StoryFn<typeof Banner> = (args) => <Banner {...args} />

export const Primary = Template.bind({})
Primary.args = {
  children,
  color: 'yellow',
  buttonLabel: 'Click me',
  buttonIconRight: 'rotate-right',
}
