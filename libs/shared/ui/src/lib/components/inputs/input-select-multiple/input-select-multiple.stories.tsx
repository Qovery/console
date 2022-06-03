import { Value } from '@console/shared/interfaces'
import { Story, Meta } from '@storybook/react'
import { InputSelectMultiple, InputSelectMultipleProps } from './input-select-multiple'

export default {
  component: InputSelectMultiple,
  title: 'Inputs/InputSelectMultiple',
} as Meta

const options: Value[] = [
  {
    label: 'Test 1',
    value: 'test1',
  },
  {
    label: 'Test 2',
    value: 'test2',
  },
  {
    label: 'Test 3',
    value: 'test3',
  },
]

const Template: Story<InputSelectMultipleProps> = (args) => <InputSelectMultiple {...args} />

export const Primary = Template.bind({})
Primary.args = {
  label: 'Select Multiple',
  options: options,
}
