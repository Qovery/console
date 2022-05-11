import Modal, { ModalContentProps, ModalProps } from './modal'
import { Meta, Story } from '@storybook/react'
import Button from '../buttons/button/button'

export default {
  component: Modal,
  title: 'Modals/Default',
} as Meta

const Content = (props: ModalContentProps) => {
  const { setOpen } = props

  return (
    <div className="py-4 px-5">
      <h3 className="h3 font-medium text-base text-text-500">Title</h3>
      <p className="text-sm text-text-400 mt-2 mb-6">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      <div className="flex justify-end">
        <Button onClick={() => setOpen && setOpen(false)}>Save changes</Button>
      </div>
    </div>
  )
}

const Template: Story<ModalProps> = (...args) => (
  <div className="relative">
    <Modal trigger={<Button>Trigger</Button>} {...args}>
      <Content />
    </Modal>
  </div>
)

export const Primary = Template.bind({
  width: 400,
  className: '',
  defaultOpen: false,
  buttonClose: true,
})
