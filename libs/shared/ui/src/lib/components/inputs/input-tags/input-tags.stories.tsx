import type { Meta, StoryFn } from '@storybook/react-webpack5'
import { InputTags, type InputTagsProps } from './input-tags'

export default {
  component: InputTags,
  title: 'Inputs/InputTags',
} as Meta

const Template: StoryFn<InputTagsProps> = (args) => <InputTags {...args} />

export const Primary = Template.bind({})
Primary.args = {
  label: 'Tags',
  tags: ['Thailand', 'India', 'Vietnam', 'Turkey'],
}
