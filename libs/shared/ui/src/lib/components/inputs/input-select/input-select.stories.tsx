import { Meta, Story } from '@storybook/react'
import { InputSelect, InputSelectProps } from './input-select'

export default {
  component: InputSelect,
  title: 'Inputs/InputSelect',
} as Meta

const Template: Story<InputSelectProps> = (args) => <InputSelect {...args} />

export const Primary = Template.bind({})
Primary.args = {
  label: 'Type of use',
  items: [
    {
      label: 'Personal',
      value: 'personal',
    },
    {
      label: 'Work',
      value: 'work',
    },
    {
      label: 'School',
      value: 'school',
    },
  ],
}
