import type { Meta } from '@storybook/react'
import Button from '../button/button'
import Icon from '../icon/icon'
import { IconAwesomeEnum } from '../icon/icon-awesome.enum'
import { ToggleGroup } from './toggle-group'

const Story: Meta<typeof ToggleGroup.Root> = {
  component: ToggleGroup.Root,
  title: 'ToggleGroup',
  decorators: [
    (Story) => (
      <div style={{ background: 'white', padding: '3em' }}>
        <Story />
      </div>
    ),
  ],
}
export default Story

export const Primary = {
  render: () => (
    <ToggleGroup.Root type="single">
      <ToggleGroup.Item value="left" aria-label="Left aligned">
        <Button variant="surface" color="neutral" size="md" className="rounded-r-none">
          <Icon name={IconAwesomeEnum.PLAY} className="mr-3" />
          <Icon name={IconAwesomeEnum.ANGLE_DOWN} />
        </Button>
      </ToggleGroup.Item>
      <ToggleGroup.Item className="relative" value="center" aria-label="Center aligned">
        <Button variant="surface" color="neutral" size="md" className="rounded-none">
          <Icon name={IconAwesomeEnum.SCROLL} />
        </Button>
      </ToggleGroup.Item>
      <ToggleGroup.Item value="right" aria-label="Right aligned">
        <Button variant="surface" color="neutral" size="md" className="rounded-l-none">
          <Icon name={IconAwesomeEnum.WHEEL} />
        </Button>
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  ),
}
