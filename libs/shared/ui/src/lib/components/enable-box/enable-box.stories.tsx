import { type Meta, type Story } from '@storybook/react'
import { EnableBox, type EnableBoxProps } from './enable-box'

export default {
  component: EnableBox,
  title: 'EnableBox',
} as Meta

const Template: Story<EnableBoxProps> = (args) => (
  <EnableBox {...args}>
    <ul>
      <li>Any</li>
      <li>Dom</li>
      <li>You</li>
      <li>Like</li>
    </ul>
  </EnableBox>
)

export const Primary = Template.bind({})
Primary.args = {
  name: 'The box',
  description: 'The box description',
  title: 'The box title',
  className: '',
  dataTestId: '',
  setChecked: () => {
    console.log('checked')
  },
  checked: false,
}
