import { ComponentMeta, ComponentStory } from '@storybook/react'
import { IconAwesomeEnum } from '../icon/icon-awesome.enum'
import { BannerBox } from './banner-box'

export default {
  component: BannerBox,
  title: 'BannerBox',
  argTypes: {
    icon: {
      options: IconAwesomeEnum,
      control: { type: 'select' },
    },
  },
} as ComponentMeta<typeof BannerBox>

const Template: ComponentStory<typeof BannerBox> = (args) => <BannerBox {...args} />

export const Primary = Template.bind({})
Primary.args = {
  title: 'Lorem ipsum',
  message:
    'You are about to import environment variables into your environment. Please note that if you import a variable with the same name as an existing variable, it will be overwrited. ',
  className: '',
  icon: IconAwesomeEnum.TRIANGLE_EXCLAMATION,
}
