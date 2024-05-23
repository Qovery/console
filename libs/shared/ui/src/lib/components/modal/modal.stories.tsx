import { type Meta, type Story } from '@storybook/react'
import Button from '../button/button'
import Modal, { type ModalContentProps, type ModalProps } from './modal'

export default {
  component: Modal,
  title: 'Modals/Default',
} as Meta

const Content = (props: ModalContentProps) => {
  const { setOpen } = props

  return (
    <div className="px-5 py-4">
      <h3 className="h3 text-base font-medium text-neutral-400">Title</h3>
      <p className="mb-6 mt-2 text-sm text-neutral-350">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      <div className="flex justify-end">
        <Button type="button" size="lg" onClick={() => setOpen && setOpen(false)}>
          Save changes
        </Button>
      </div>
    </div>
  )
}

const Template: Story<ModalProps> = (...args) => (
  <div className="relative">
    <Modal
      trigger={
        <Button type="button" size="lg">
          Trigger
        </Button>
      }
      {...args}
    >
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
