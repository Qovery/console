import type { Meta } from '@storybook/react'
import { ButtonAction } from '../button-action/button-action'
import Icon from '../icon/icon'
import { IconAwesomeEnum } from '../icon/icon-awesome.enum'

const Story: Meta<typeof ButtonAction.Root> = {
  component: ButtonAction.Root,
  title: 'ButtonAction',
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
    <ButtonAction.Root>
      <ButtonAction.Item asChild>
        <ButtonAction.Button className="rounded-r-none">
          <Icon name={IconAwesomeEnum.PLAY} className="mr-3" />
          <Icon name={IconAwesomeEnum.ANGLE_DOWN} />
        </ButtonAction.Button>
      </ButtonAction.Item>
      <ButtonAction.Item asChild>
        <ButtonAction.Button className="rounded-none border-x-0">
          <Icon name={IconAwesomeEnum.SCROLL} />
        </ButtonAction.Button>
      </ButtonAction.Item>
      <ButtonAction.Item asChild>
        <ButtonAction.Button className="rounded-l-none">
          <Icon name={IconAwesomeEnum.WHEEL} />
        </ButtonAction.Button>
      </ButtonAction.Item>
    </ButtonAction.Root>
  ),
}
