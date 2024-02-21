import { type Meta, type Story } from '@storybook/react'
import { IconEnum } from '@qovery/shared/enums'
import { type Value } from '@qovery/shared/interfaces'
import { Icon } from '../../icon/icon'
import { InputSelect, type InputSelectProps } from './input-select'

export default {
  component: InputSelect,
  title: 'Inputs/InputSelect',
} as Meta

const options: Value[] = [
  {
    label: 'Test 1',
    value: 'test1',
    icon: <Icon name={IconEnum.GITHUB} className="w-4" />,
    onClickEditable: () => console.log('editable'),
  },
  {
    label: 'Test 2',
    value: 'test2',
    icon: <Icon name={IconEnum.GITLAB} className="w-4" />,
    onClickEditable: () => console.log('editable'),
  },
  {
    label: 'Test 3',
    value: 'test3',
    onClickEditable: () => console.log('editable'),
  },
]

const Template: Story<InputSelectProps> = (args) => <InputSelect {...args} />

export const Single = Template.bind({})
Single.args = {
  label: 'Select',
  options: options,
  value: 'test1',
  isSearchable: false,
  menuListButton: {
    label: 'New element',
    icon: <Icon iconName="circle-plus" className="text-brand-500" />,
    onClick: () => console.log('new element'),
  },
}

export const Multi = Template.bind({})
Multi.args = {
  label: 'Select Multiple',
  options: options,
  isMulti: true,
  value: ['test1', 'test2'],
  isSearchable: false,
}
