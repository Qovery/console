import { Meta, Story } from '@storybook/react'
import { Value } from '@console/shared/interfaces'
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

export const Single = Template.bind({})
Single.args = {
  label: 'Select',
  options: options,
  value: 'test1',
}

export const Multi = Template.bind({})
Multi.args = {
  label: 'Select Multiple',
  options: options,
  isMulti: true,
  value: ['test1', 'test2'],
}
