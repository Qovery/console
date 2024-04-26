import { type Meta, type Story } from '@storybook/react'
import Button from '../../button/button'
import Modal from '../../modal/modal'
import { ModalConfirmation, type ModalConfirmationProps } from '../modal-confirmation/modal-confirmation'

export default {
  component: Modal,
  title: 'Modals/Confirmation',
} as Meta

const Template: Story<ModalConfirmationProps> = (args) => (
  <div className="relative">
    <Modal
      defaultOpen={true}
      width={488}
      trigger={
        <Button type="button" size="lg">
          Trigger
        </Button>
      }
    >
      <ModalConfirmation
        title={args.title}
        description={args.description}
        name={args.name}
        placeholder={args.placeholder}
        isDelete={args.isDelete}
        callback={() => {
          console.log('callback')
        }}
      />
    </Modal>
  </div>
)

export const Primary = Template.bind({})

Primary.args = {
  title: 'Cancel environment deployment',
  description: 'Please confirm by entering the name of your environment:',
  name: 'staging',
  placeholder: 'Enter the environment name',
}

export const Delete = Template.bind({})

Delete.args = {
  title: 'Delete environment',
  name: 'staging',
  isDelete: true,
}
