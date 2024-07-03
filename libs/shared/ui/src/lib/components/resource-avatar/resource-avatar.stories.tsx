import { type Meta, type StoryFn } from '@storybook/react'
import Icon from '../icon/icon'
import Indicator from '../indicator/indicator'
import Tooltip from '../tooltip/tooltip'
import { ResourceAvatar, ResourceAvatarIcon, type ResourceAvatarProps } from './resource-avatar'

export default {
  component: ResourceAvatar,
  title: 'ResourceAvatar',
  parameters: {
    backgrounds: {
      default: 'default',
      values: [{ name: 'default', value: '#fff' }],
    },
  },
} as Meta

const Template: StoryFn<ResourceAvatarProps> = () => (
  <Indicator
    content={
      <Tooltip content="My tooltip">
        <span>
          <Icon className="h-full w-full" name="AWS" />
        </span>
      </Tooltip>
    }
  >
    <ResourceAvatar size="md">
      <ResourceAvatarIcon icon="APPLICATION" size="md" />
    </ResourceAvatar>
  </Indicator>
)

export const Primary = Template.bind({})
