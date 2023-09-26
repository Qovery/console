import { type Meta, type Story } from '@storybook/react'
import { ToastEnum, toast } from '../../utils/toast'
import { ButtonLegacy } from '../buttons/button-legacy/button-legacy'
import { ToastBehavior, type ToastProps } from './toast'

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
      <ButtonLegacy
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
      </ButtonLegacy>
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
