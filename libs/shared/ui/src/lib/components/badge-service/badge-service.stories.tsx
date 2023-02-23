import { Meta, Story } from '@storybook/react'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { BadgeService, BadgeServiceProps } from './badge-service'

export default {
  component: BadgeService,
  title: 'BadgeService',
} as Meta

const Template: Story<BadgeServiceProps> = (args) => <BadgeService {...args} />

export const Primary = Template.bind({})
Primary.args = {
  serviceType: ServiceTypeEnum.DATABASE,
  cloudProvider: CloudProviderEnum.AWS,
  size: '64',
}
