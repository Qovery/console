import { Meta, Story } from '@storybook/react'
import TagCommit, { TagCommitProps } from './tag-commit'

export default {
  component: TagCommit,
  title: 'Tag/TagCommit',
} as Meta

const Template: Story<TagCommitProps> = (args) => <TagCommit {...args} />

export const Primary = Template.bind({})

Primary.args = {
  commitId: 'abcdefghijklmnopqrstuvwxyz',
}
