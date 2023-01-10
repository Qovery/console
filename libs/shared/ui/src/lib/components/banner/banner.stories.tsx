import { ComponentMeta, ComponentStory } from '@storybook/react'
import { IconAwesomeEnum } from '../icon/icon-awesome.enum'
import { Banner, BannerStyle } from './banner'

export default {
  component: Banner,
  title: 'Banner',
  argTypes: {
    bannerStyle: {
      control: {
        type: 'select',
        options: BannerStyle,
      },
    },
  },
} as ComponentMeta<typeof Banner>

const children = <p>Hello Banner my old friend</p>
const Template: ComponentStory<typeof Banner> = (args) => <Banner {...args} />

export const Primary = Template.bind({})
Primary.args = {
  children,
  bannerStyle: BannerStyle.WARNING,
  buttonLabel: 'Click me',
  buttonIconRight: IconAwesomeEnum.ROTATE_RIGHT,
}
