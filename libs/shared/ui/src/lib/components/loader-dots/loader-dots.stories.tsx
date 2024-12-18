import { type ComponentMeta, type ComponentStory } from '@storybook/react'
import { LoaderDots } from './loader-dots'

export default {
  component: LoaderDots,
  title: 'LoaderDots',
  argTypes: {},
} as ComponentMeta<typeof LoaderDots>

const Template: ComponentStory<typeof LoaderDots> = (args) => <LoaderDots {...args} />

export const Primary = Template.bind({})
Primary.args = {
  className: '',
}
