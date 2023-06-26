import { Story } from '@storybook/react'
import { InputFilter, InputFilterProps } from './input-filter'

export default {
  title: 'Inputs//InputFilter',
  component: InputFilter,
}

const Template: Story<InputFilterProps> = (args) => <InputFilter {...args} />

export const Default = Template.bind({})
Default.args = {
  name: 'Filter',
  options: [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ],
  onChange: (value) => console.log('Selected value:', value),
  defaultValue: 'option1',
}
