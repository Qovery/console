import { Meta, Story } from '@storybook/react'
import { ToastEnum, toast } from '../../utils/toast'
import { Button } from '../buttons/button/button'
import { ToastBehavior, ToastProps } from './toast'

export default {
  component: ToastBehavior,
  title: 'Toaster',
  argTypes: {
    actionIcon: {
      options: ['icon-solid-wheel', 'icon-solid-circle-plus', 'icon-solid-book', 'icon-solid-key'],
      control: { type: 'select' },
    },
  },
} as Meta

const Template: Story<ToastProps> = (args) => {
  return (
    <div>
      <Button
        onClick={() =>
          toast(
            args.status,
            args.title || '',
            args.description,
            args.callback,
            args.actionIcon,
            args.actionLabel,
            args.externalLink
          )
        }
      >
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
  callback: () => console.log('my-callback'),
}

export const WithActionIcon = Template.bind({})

WithActionIcon.args = {
  status: ToastEnum.SUCCESS,
  title: 'Cluster installed',
  description: '3 applications has been deployed',
  callback: () => console.log('my-callback'),
  actionIcon: 'icon-solid-pen',
}
export const WithActionLabel = Template.bind({})

WithActionLabel.args = {
  status: ToastEnum.SUCCESS,
  title: 'Cluster installed',
  description: '3 applications has been deployed',
  callback: () => console.log('my-callback'),
  actionLabel: 'Redeploy',
  externalLink: 'https://www.google.com',
}
