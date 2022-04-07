import { ModalArrow, ModalArrowProps } from './modal-arrow'
import { Meta, Story } from '@storybook/react'
import Button from '../../buttons/button/button'

export default {
  component: ModalArrow,
  title: 'ModalArrow',
} as Meta

const ModalContent = () => {
  return <p>This is a modal</p>
}

const Template: Story<ModalArrowProps> = (args) => (

  <ModalArrow trigger={<Button>Trigger</Button>}>
    <ModalContent />
  </ModalArrow>
)

export const Primary = Template.bind({})
