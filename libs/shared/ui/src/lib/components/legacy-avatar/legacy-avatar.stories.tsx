import { type Meta, type Story } from '@storybook/react'
import { IconEnum } from '@qovery/shared/enums'
import { LegacyAvatar, type LegacyAvatarProps } from './legacy-avatar'

export default {
  component: LegacyAvatar,
  title: 'LegacyAvatar',
} as Meta

const Template: Story<LegacyAvatarProps> = (args) => <LegacyAvatar {...args}></LegacyAvatar>

export const Primary = Template.bind({})
Primary.args = {
  firstName: 'Rémi',
  lastName: 'Bonnet',
  icon: IconEnum.GITLAB,
}
