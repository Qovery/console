import type { Meta, StoryFn } from '@storybook/react-webpack5'
import ModalProvider from '../modal/modal-root'
import { BlockContent, type BlockContentProps } from './block-content'

export default {
  component: BlockContent,
  title: 'Composed Components/BlockContent',
} as Meta

const Template: StoryFn<BlockContentProps> = (args) => (
  <ModalProvider>
    <BlockContent {...args} />
  </ModalProvider>
)

export const Primary = Template.bind({})
Primary.args = {
  title: 'Delete',
  children: <p>my children</p>,
}
