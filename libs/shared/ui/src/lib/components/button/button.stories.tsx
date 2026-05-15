import type { Meta } from '@storybook/react-webpack5'
import { Icon } from '../icon/icon'
import { Button } from './button'

const Story: Meta<typeof Button> = {
  component: Button,
  title: 'Button',
  decorators: [
    (Story) => (
      <div style={{ background: 'white', padding: '3em' }}>
        <Story />
      </div>
    ),
  ],
}

export const Primary = {
  args: {
    children: 'Foobar',
  },
}

export const WithIcons = {
  args: {
    children: (
      <>
        <Icon data-align="prefix" iconName="arrow-left" />
        Upload
        <Icon data-align="suffix" iconName="arrow-right" />
      </>
    ),
  },
}

export default Story
