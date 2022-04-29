import { EnvironmentModeEnum } from 'qovery-typescript-axios'
import { Meta, Story } from '@storybook/react'
import { select } from '@storybook/addon-knobs'
import { TagMode, TagModeProps } from './tag-mode'

export default {
  component: TagMode,
  title: 'Tag/TagMode',
} as Meta

const Template: Story<TagModeProps> = (args) => <TagMode {...args} />

export const Primary = Template.bind({})

Primary.args = {
  status: select('Type', EnvironmentModeEnum, EnvironmentModeEnum.PREVIEW),
}
