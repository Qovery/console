import type { Meta } from '@storybook/react'
import { IconAwesomeEnum } from '../icon/icon-awesome.enum'
import { Link, type LinkProps } from './link'

const Story: Meta<typeof Link> = {
  component: Link,
  title: 'Link',
  decorators: [
    (Story) => (
      <div style={{ background: 'white', padding: '3em' }}>
        <Story />
      </div>
    ),
  ],
}
export const Primary = {
  render: (args: LinkProps) => (
    <Link icon={IconAwesomeEnum.CIRCLE_PLUS} {...args}>
      My link
    </Link>
  ),
}
export default Story
