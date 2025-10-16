import type { Meta, StoryFn } from '@storybook/react-webpack5'
import Pagination from './pagination'

export default {
  component: Pagination,
  title: 'Pagination',
} as Meta<typeof Pagination>

const Template: StoryFn<typeof Pagination> = (args) => <Pagination {...args} />

export const Primary = Template.bind({})
Primary.args = {
  onPageSizeChange: () => {
    console.log('onPageSizeChange')
  },
  pageSize: '50',
  previousDisabled: false,
  nextDisabled: false,
  onNext: () => {
    console.log('onNext')
  },
  onPrevious: () => {
    console.log('onPrevious')
  },
}
