import { type Meta, type Story } from '@storybook/react'
import Button from '../button/button'
import { Skeleton, type SkeletonProps } from './skeleton'

export default {
  component: Skeleton,
  title: 'Skeleton',
} as Meta

const Template: Story<SkeletonProps> = (args) => (
  <Skeleton {...args}>
    <Button type="button" size="lg">
      Not hidden by Skeleton
    </Button>
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
