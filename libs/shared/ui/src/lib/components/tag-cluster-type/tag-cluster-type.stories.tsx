import { type Meta, type StoryObj } from '@storybook/react'
import { CloudProviderEnum, KubernetesEnum } from 'qovery-typescript-axios'
import { TagClusterType } from './tag-cluster-type'

const meta: Meta<typeof TagClusterType> = {
  component: TagClusterType,
  title: 'Tag/TagClusterType',
}

export default meta

type Story = StoryObj<typeof TagClusterType>

export const Primary: Story = {
  args: {
    cloudProvider: CloudProviderEnum.AWS,
    kubernetes: KubernetesEnum.MANAGED,
  },
}
