import { type Meta, type Story } from '@storybook/react'
import ButtonLegacy from '../buttons/button-legacy/button-legacy'
import Modal, { type ModalContentProps, type ModalProps } from './modal'

export default {
  component: Modal,
  title: 'Modals/Default',
} as Meta

const Content = (props: ModalContentProps) => {
  const { setOpen } = props

  return (
    <div className="py-4 px-5">
      <h3 className="h3 font-medium text-base text-neutral-400">Title</h3>
      <p className="text-sm text-neutral-350 mt-2 mb-6">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      <div className="flex justify-end">
        <ButtonLegacy onClick={() => setOpen && setOpen(false)}>Save changes</ButtonLegacy>
      </div>
    </div>
  )
}

const Template: Story<ModalProps> = (...args) => (
  <div className="relative">
    <Modal trigger={<ButtonLegacy>Trigger</ButtonLegacy>} {...args}>
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
