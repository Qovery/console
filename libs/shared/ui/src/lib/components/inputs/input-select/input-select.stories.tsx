import { Meta, Story } from '@storybook/react'
import { IconEnum } from '@qovery/shared/enums'
import { Value } from '@qovery/shared/interfaces'
import Icon from '../../icon/icon'
import { InputSelect, InputSelectProps } from './input-select'

export default {
  component: InputSelect,
  title: 'Inputs/InputSelect',
} as Meta

const options: Value[] = [
  {
    label: 'Test 1',
    value: 'test1',
    icon: <Icon name={IconEnum.GITHUB} className="w-4" />,
  },
  {
    label: 'Test 2',
    value: 'test2',
    icon: <Icon name={IconEnum.GITLAB} className="w-4" />,
  },
  {
    label: 'Test 3',
    value: 'test3',
  },
]

const Template: Story<InputSelectProps> = (args) => <InputSelect {...args} />

export const Single = Template.bind({})
Single.args = {
  label: 'Select',
  options: options,
  value: 'test1',
  isSearchable: false,
}

export const Multi = Template.bind({})
Multi.args = {
  label: 'Select Multiple',
  options: options,
  isMulti: true,
  value: ['test1', 'test2'],
  isSearchable: false,
}
