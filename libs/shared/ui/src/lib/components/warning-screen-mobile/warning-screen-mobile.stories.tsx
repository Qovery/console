import type { Meta, StoryFn } from '@storybook/react-webpack5'
import { WarningScreenMobile } from './warning-screen-mobile'

export default {
  component: WarningScreenMobile,
  title: 'Warning Screen Mobile',
} as Meta<typeof WarningScreenMobile>

const Template: StoryFn<typeof WarningScreenMobile> = (args) => <WarningScreenMobile />

export const Primary = Template.bind({})
