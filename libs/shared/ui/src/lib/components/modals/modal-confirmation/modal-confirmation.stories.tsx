import { Meta, Story } from '@storybook/react'
import Modal, { ModalProps } from '../../modal/modal'
import { Button } from '../../buttons/button/button'
import { ModalConfirmation } from '../modal-confirmation/modal-confirmation'

export default {
  component: Modal,
  title: 'Modals/Confirmation',
} as Meta

const Template: Story<ModalProps> = () => (
  <div className="relative">
    <Modal defaultOpen={true} width={488} trigger={<Button>Trigger</Button>}>
      <ModalConfirmation
        title="Cancel environment deployment"
        description="Please confirm by enter the name of you environment:"
        name="staging"
        placeholder="Enter the environment name"
        callback={() => {
          console.log('callback')
        }}
      />
    </Modal>
  </div>
)

export const Primary = Template.bind({})
