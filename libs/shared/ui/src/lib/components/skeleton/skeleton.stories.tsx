import { type Meta, type Story } from '@storybook/react'
import ButtonLegacy from '../buttons/button-legacy/button-legacy'
import { Skeleton, type SkeletonProps } from './skeleton'

export default {
  component: Skeleton,
  title: 'Skeleton',
} as Meta

const Template: Story<SkeletonProps> = (args) => (
  <Skeleton {...args}>
    <ButtonLegacy>Not hidden by Skeleton</ButtonLegacy>
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
