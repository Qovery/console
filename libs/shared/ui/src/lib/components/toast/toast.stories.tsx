import { Meta, Story } from '@storybook/react'
import { Toast, ToastProps } from './toast'
import { Button } from '../buttons/button/button'

export default {
  component: Toast,
  title: 'Toast',
} as Meta

const Template: Story<ToastProps> = (args) => <Toast {...args} trigger={<Button>Trigger toast</Button>} />

export const Primary = Template.bind({})

Primary.args = {}
