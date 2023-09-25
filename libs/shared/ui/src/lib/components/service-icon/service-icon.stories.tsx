import { type Meta, type Story } from '@storybook/react'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { ServiceIcon, type ServiceIconProps } from './service-icon'

export default {
  component: ServiceIcon,
  title: 'ServiceIcon',
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

const Template: Story<ServiceIconProps> = (args) => <ServiceIcon {...args} />

export const Primary = Template.bind({})
Primary.args = {
  serviceType: ServiceTypeEnum.DATABASE,
  cloudProvider: CloudProviderEnum.AWS,
  size: '32',
  padding: '2',
}
