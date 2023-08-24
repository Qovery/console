import { type ComponentMeta, type ComponentStory } from '@storybook/react'
import { PasswordShowHide } from './password-show-hide'

export default {
  component: PasswordShowHide,
  title: 'PasswordShowHide',
  argTypes: {
    value: {
      control: { type: 'text' },
    },
  },
} as ComponentMeta<typeof PasswordShowHide>

const Template: ComponentStory<typeof PasswordShowHide> = (args) => <PasswordShowHide {...args} />

export const Primary = Template.bind({})
Primary.args = {
  value: 'Un text très long ça te tenterait ou bien\n pour voir comment le truc sen sort ?',
  defaultVisible: false,
  isSecret: false,
  canCopy: false,
}
