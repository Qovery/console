import { Meta, Story } from '@storybook/react'
import { InputTags, InputTagsProps } from './input-tags'

export default {
  component: InputTags,
  title: 'Inputs/InputTags',
} as Meta

const Template: Story<InputTagsProps> = (args) => <InputTags {...args} />

export const Primary = Template.bind({})
Primary.args = {
  label: 'Tags',
  tags: ['Thailand', 'India', 'Vietnam', 'Turkey'],
}
