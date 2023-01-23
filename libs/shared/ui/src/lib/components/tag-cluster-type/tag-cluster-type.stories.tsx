import { select } from '@storybook/addon-knobs'
import { Meta, Story } from '@storybook/react'
import { CloudProviderEnum, KubernetesEnum } from 'qovery-typescript-axios'
import { TagClusterType, TagClusterTypeProps } from './tag-cluster-type'

export default {
  component: TagClusterType,
  title: 'Tag/TagClusterType',
} as Meta

const Template: Story<TagClusterTypeProps> = (args) => <TagClusterType {...args} />

export const Primary = Template.bind({})

Primary.args = {
  cloud_provider: select('Cloud Provider', CloudProviderEnum, CloudProviderEnum.AWS),
  kubernetes: select('Kubernetes', KubernetesEnum, KubernetesEnum.MANAGED),
}
