import { Button } from '@console/shared/ui'
import { Meta, Story } from '@storybook/react'
import { Skeleton, SkeletonProps } from './skeleton'

export default {
  component: Skeleton,
  title: 'Skeleton',
} as Meta

const Template: Story<SkeletonProps> = (args) => (
  <Skeleton {...args}>
    <Button>Not hidden by Skeleton</Button>
  </Skeleton>
)

export const Primary = Template.bind({})

Primary.args = {
  show: true,
  width: 177,
  height: 36,
  rounded: false,
  square: false,
}
