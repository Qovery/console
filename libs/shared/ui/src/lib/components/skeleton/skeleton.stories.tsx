import type { Meta, StoryFn } from '@storybook/react-webpack5'
import Button from '../button/button'
import { Skeleton, type SkeletonProps } from './skeleton'

export default {
  component: Skeleton,
  title: 'Skeleton',
} as Meta

const Template: StoryFn<SkeletonProps> = (args) => (
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
