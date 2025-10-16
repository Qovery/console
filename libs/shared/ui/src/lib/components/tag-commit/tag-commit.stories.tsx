import type { Meta, StoryFn } from '@storybook/react-webpack5'
import TagCommit, { type TagCommitProps } from './tag-commit'

export default {
  component: TagCommit,
  title: 'Tag/TagCommit',
} as Meta

const Template: StoryFn<TagCommitProps> = (args) => <TagCommit {...args} />

export const Primary = Template.bind({})

Primary.args = {
  commitId: 'abcdefghijklmnopqrstuvwxyz',
}
