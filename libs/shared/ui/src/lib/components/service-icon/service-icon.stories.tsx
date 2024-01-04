import { type Meta } from '@storybook/react'
import { CloudProviderEnum } from 'qovery-typescript-axios'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import { ServiceIcon } from './service-icon'

const Story: Meta<typeof ServiceIcon> = {
  component: ServiceIcon,
  title: 'ServiceIcon',
  parameters: {
    backgrounds: {
      default: 'white',
      values: [{ name: 'white', value: '#fff' }],
    },
  },
}
export default Story

export const Primary = {
  args: {
    service: {
      serviceType: ServiceTypeEnum.DATABASE,
    },
    cloudProvider: CloudProviderEnum.AWS,
    size: '32',
    padding: '2',
  },
}
