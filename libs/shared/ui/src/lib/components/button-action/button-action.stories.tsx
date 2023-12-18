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
      <ButtonAction.Button>
        <Icon name={IconAwesomeEnum.PLAY} className="mr-3" />
        <Icon name={IconAwesomeEnum.ANGLE_DOWN} />
      </ButtonAction.Button>
      <ButtonAction.Button>
        <Icon name={IconAwesomeEnum.SCROLL} />
      </ButtonAction.Button>
      <ButtonAction.Button>
        <Icon name={IconAwesomeEnum.SCROLL} />
      </ButtonAction.Button>
      <ButtonAction.Button>
        <Icon name={IconAwesomeEnum.WHEEL} />
      </ButtonAction.Button>
    </ButtonAction.Root>
  ),
}
