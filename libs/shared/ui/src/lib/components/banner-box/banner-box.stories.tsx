import { type ComponentMeta, type ComponentStory } from '@storybook/react'
import { IconAwesomeEnum } from '../icon/icon-awesome.enum'
import { BannerBox, BannerBoxEnum } from './banner-box'

export default {
  component: BannerBox,
  title: 'BannerBox',
  argTypes: {
    icon: {
      options: IconAwesomeEnum,
      control: { type: 'select' },
    },
    type: {
      options: BannerBoxEnum,
      control: { type: 'select' },
    },
  },
} as ComponentMeta<typeof BannerBox>

const Template: ComponentStory<typeof BannerBox> = (args) => <BannerBox className="max-w-2xl" {...args} />

export const Primary = Template.bind({})
Primary.args = {
  type: BannerBoxEnum.DEFAULT,
  title: 'Lorem ipsum',
  message:
    'You are about to import environment variables into your environment. Please note that if you import a variable with the same name as an existing variable, it will be overwrited. ',
  className: '',
  icon: IconAwesomeEnum.TRIANGLE_EXCLAMATION,
  iconInCircle: false,
  iconRealColors: false,
}
