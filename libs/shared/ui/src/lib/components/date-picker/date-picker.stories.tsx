import { Meta, Story } from '@storybook/react'
import { DatePicker } from './date-picker'

export default {
  component: DatePicker,
  title: 'DatePicker',
} as Meta

const Template: Story<any> = (args) => <DatePicker {...args} />

export const Primary = Template.bind({})
// Primary.args = {
//   description: 'Need help? You may find these links useful',
//   links: [
//     {
//       link: '#',
//       linkLabel: 'How to configure my application',
//       external: true,
//     },
//     {
//       link: '#',
//       linkLabel: 'How to delete my application',
//       external: true,
//     },
//   ],
// }
