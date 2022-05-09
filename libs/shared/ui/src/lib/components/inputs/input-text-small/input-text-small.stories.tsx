import { Meta, Story } from '@storybook/react'
import { InputTextSmall, InputTextSmallProps } from './input-text-small'

export default {
  component: InputTextSmall,
  title: 'Inputs/InputTextSmall',
} as Meta

const Template: Story<InputTextSmallProps> = (args) => <InputTextSmall {...args} />

export const Primary = Template.bind({})
Primary.args = {
  name: 'name',
  placeholder: 'Adding an environment name',
}
