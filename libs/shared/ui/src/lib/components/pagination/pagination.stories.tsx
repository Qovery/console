import { type ComponentMeta, type ComponentStory } from '@storybook/react'
import Pagination from './pagination'

export default {
  component: Pagination,
  title: 'Pagination',
} as ComponentMeta<typeof Pagination>

const Template: ComponentStory<typeof Pagination> = (args) => <Pagination {...args} />

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
