import { Modal, ModalProps } from './modal'
import { Meta, Story } from '@storybook/react'
import Button from '../buttons/button/button'

export default {
  component: Modal,
  title: 'Modal',
} as Meta

const ModalContent = () => {
  return (
    <div className="py-4 px-5 text-center">
      <h3 className="font-medium text-base text-text-500">Modal title</h3>
      <p className="text-sm text-text-400">Modal content</p>
    </div>
  )
}

const Template: Story<ModalProps> = (args) => (
  <Modal {...args}>
    <ModalContent />
  </Modal>
)

export const Primary = Template.bind({})
Primary.args = {
  trigger: <Button>Trigger</Button>,
}
