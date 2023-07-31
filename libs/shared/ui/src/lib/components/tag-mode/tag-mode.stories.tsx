import { Meta, StoryObj } from '@storybook/react'
import { EnvironmentModeEnum } from 'qovery-typescript-axios'
import { TagMode } from './tag-mode'

const meta: Meta<typeof TagMode> = {
  component: TagMode,
  title: 'Tag/TagMode',
}

export default meta

type Story = StoryObj<typeof TagMode>

export const Primary: Story = {
  args: {
    status: EnvironmentModeEnum.PREVIEW,
  },
}
