import type { Meta, StoryFn } from '@storybook/react-webpack5'
import { IconEnum } from '@qovery/shared/enums'
import { LegacyAvatar, type LegacyAvatarProps } from './legacy-avatar'

export default {
  component: LegacyAvatar,
  title: 'LegacyAvatar',
} as Meta

const Template: StoryFn<LegacyAvatarProps> = (args) => <LegacyAvatar {...args}></LegacyAvatar>

export const Primary = Template.bind({})
Primary.args = {
  firstName: 'Rémi',
  lastName: 'Bonnet',
  icon: IconEnum.GITLAB,
}
