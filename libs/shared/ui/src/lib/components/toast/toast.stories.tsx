import type { Meta, StoryFn } from '@storybook/react-webpack5'
import { toast } from '../../utils/toast'
import Button from '../button/button'
import { ToastBehavior, type ToastProps } from './toast'

export default {
  component: ToastBehavior,
  title: 'Toaster',
} as Meta

const Template: StoryFn<ToastProps> = (args) => {
  return (
    <div>
      <Button
        type="button"
        size="lg"
        onClick={() => toast(args.status, args.title || '', args.description, args.callback, args.actionLabel)}
      >
        Trigger toast
      </Button>
      <ToastBehavior />
    </div>
  )
}

export const Primary = Template.bind({})

Primary.args = {
  status: 'success',
  title: 'Cluster installed',
  description: '3 applications has been deployed',
  callback: () => console.log('my-callback'),
}

export const Secondary = Template.bind({})

Secondary.args = {
  status: 'success',
  title: 'Cluster installed',
  description: '3 applications has been deployed',
  callback: () => console.log('my-callback'),
}
export const WithActionLabel = Template.bind({})

WithActionLabel.args = {
  status: 'success',
  title: 'Cluster installed',
  description: '3 applications has been deployed',
  callback: () => console.log('my-callback'),
  actionLabel: 'Redeploy',
}
