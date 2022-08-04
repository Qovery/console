import { ComponentMeta, ComponentStory } from '@storybook/react'
import { WarningBox } from './warning-box'
import { IconAwesomeEnum } from '../icon/icon-awesome.enum'

export default {
  component: WarningBox,
  title: 'WarningBox',
  argTypes: {
    icon: {
      options: IconAwesomeEnum,
      control: { type: 'select' },
    },
  },
} as ComponentMeta<typeof WarningBox>

const Template: ComponentStory<typeof WarningBox> = (args) => <WarningBox {...args} />

export const Primary = Template.bind({})
Primary.args = {
  message:
    'You are about to import environment variables into your environment. Please note that if you import a variable with the same name as an existing variable, it will be overwrited. ',
  className: '',
  icon: IconAwesomeEnum.TRIANGLE_EXCLAMATION,
}
