import { type ComponentMeta, type ComponentStory } from '@storybook/react'
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
} as ComponentMeta<typeof Banner>

const children = <p>Hello Banner my old friend</p>
const Template: ComponentStory<typeof Banner> = (args) => <Banner {...args} />

export const Primary = Template.bind({})
Primary.args = {
  children,
  color: 'yellow',
  buttonLabel: 'Click me',
  buttonIconRight: 'rotate-right',
}
