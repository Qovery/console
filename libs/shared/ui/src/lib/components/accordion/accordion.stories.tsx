import { Meta, Story } from '@storybook/react'
import { Accordion, AccordionProps } from './accordion'

export default {
  component: Accordion,
  title: 'Accordion',
} as Meta

const ModalContent = () => {
  return (
    <div className="py-4 px-5 text-center bg-white">
      <h3 className="font-medium text-sm text-zinc-400">Accordion title</h3>
      <p className="text-sm text-zinc-350">Accordion content</p>
    </div>
  )
}

const Template: Story<AccordionProps> = (args) => (
  <Accordion {...args}>
    <ModalContent />
  </Accordion>
)

export const Primary = Template.bind({})
Primary.args = {
  header: <p className="font-medium text-sm text-zinc-400">Accordion trigger</p>,
  children: <p>Accordion content</p>,
  open: true,
}
