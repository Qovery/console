import { Meta, Story } from '@storybook/react'
import { toast, ToastBehavior, ToastEnum, ToastProps } from './toast'
import { Button } from '../buttons/button/button'

export default {
  component: ToastBehavior,
  title: 'Toaster',
} as Meta

const Template: Story<ToastProps> = (args) => {
  return (
    <div>
      <Button onClick={() => toast(args.status, args.title, args.description, args.linkLabel, args.callback)}>
        Trigger toast
      </Button>
      <ToastBehavior />
    </div>
  )
}

export const Primary = Template.bind({})

Primary.args = {
  status: ToastEnum.SUCCESS,
  title: 'Cluster installed',
  description: '3 applications has been deployed',
  linkLabel: 'Show logs',
  callback: () => console.log('my-callback'),
}
