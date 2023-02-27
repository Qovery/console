import { Meta, Story } from '@storybook/react'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { BadgeService, BadgeServiceProps } from './badge-service'

export default {
  component: BadgeService,
  title: 'BadgeService',
  parameters: {
    backgrounds: {
      default: 'white',
      values: [{ name: 'white', value: '#fff' }],
    },
  },
  argTypes: {
    serviceType: {
      options: ServiceTypeEnum,
      control: { type: 'select' },
    },
  },
} as Meta

const Template: Story<BadgeServiceProps> = (args) => <BadgeService {...args} />

export const Primary = Template.bind({})
Primary.args = {
  serviceType: ServiceTypeEnum.DATABASE,
  cloudProvider: CloudProviderEnum.AWS,
  size: '32',
  padding: '2',
}
