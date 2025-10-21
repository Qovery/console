import type { Meta, StoryFn } from '@storybook/react-webpack5'
import { EnvironmentModeEnum } from 'qovery-typescript-axios'
import ModalProvider from '../modal/modal-root'
import { BlockContentDelete, type BlockContentDeleteProps } from './block-content-delete'

export default {
  component: BlockContentDelete,
  title: 'Composed Components/BlockContentDelete',
} as Meta

const Template: StoryFn<BlockContentDeleteProps> = (args) => (
  <ModalProvider>
    <BlockContentDelete {...args} />
  </ModalProvider>
)

export const Primary = Template.bind({})
Primary.args = {
  title: 'Delete',
  modalConfirmation: {
    title: 'Delete confirmation',
    description: 'my description',
    name: 'environment',
    mode: EnvironmentModeEnum.PRODUCTION,
  },
  description: 'my description',
  list: [
    {
      text: 'Applications',
    },
  ],
  callback: () => alert('delete'),
}
