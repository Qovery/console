import { BlockContent, BlockContentProps } from './block-content'
import { Meta, Story } from '@storybook/react'
import ModalProvider from '../modal/modal-root'

export default {
  component: BlockContent,
  title: 'Composed Components/BlockContent',
} as Meta

const Template: Story<BlockContentProps> = (args) => (
  <ModalProvider>
    <BlockContent {...args} />
  </ModalProvider>
)

export const Primary = Template.bind({})
Primary.args = {
  title: 'Delete',
  children: <p>my children</p>,
}
