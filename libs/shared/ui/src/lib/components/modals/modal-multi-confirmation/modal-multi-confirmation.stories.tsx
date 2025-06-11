import { type Meta, type Story } from '@storybook/react'
import Button from '../../button/button'
import Modal from '../../modal/modal'
import {
  ModalMultiConfirmation,
  type ModalMultiConfirmationProps,
} from '../modal-multi-confirmation/modal-multi-confirmation'

export default {
  component: Modal,
  title: 'Modals/MultiConfirmation',
} as Meta

const Template: Story<ModalMultiConfirmationProps> = (args) => (
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
      <ModalMultiConfirmation
        title={args.title}
        warning={args.warning}
        checks={args.checks}
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
  warning: 'Please confirm by entering the name of your environment:',
  checks: ['This checkbox needs to be checked'],
}

export const Delete = Template.bind({})

Delete.args = {
  title: 'Delete environment',
  warning: 'Please confirm the deletion by checking the box below:',
  isDelete: true,
  checks: ['This checkbox needs to be checked'],
}
