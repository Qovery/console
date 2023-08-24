import { type Meta, type Story } from '@storybook/react'
import { InputSizeUnit, type InputSizeUnitProps } from './input-size-unit'

export default {
  component: InputSizeUnit,
  title: 'Inputs/InputSizeUnit',
} as Meta

const Template: Story<InputSizeUnitProps> = (args) => <InputSizeUnit {...args} />

export const Primary = Template.bind({})
Primary.args = {
  name: 'memory',
  maxSize: 5024,
  currentSize: 512,
}
