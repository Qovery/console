import { type ComponentMeta, type ComponentStory } from '@storybook/react'
import { WarningScreenMobile } from './warning-screen-mobile'

export default {
  component: WarningScreenMobile,
  title: 'Warning Screen Mobile',
} as ComponentMeta<typeof WarningScreenMobile>

const Template: ComponentStory<typeof WarningScreenMobile> = (args) => <WarningScreenMobile />

export const Primary = Template.bind({})
