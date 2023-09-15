import type { Meta } from '@storybook/react'
import { StateEnum } from 'qovery-typescript-axios'
import { RunningState } from '@qovery/shared/enums'
import { StatusChip, type StatusChipProps } from './status-chip'

const AllStatus = [...Object.values(RunningState), ...Object.values(StateEnum)]

const Story: Meta<typeof StatusChip> = {
  component: StatusChip,
  title: 'StatusChip',
  argTypes: {
    status: {
      options: AllStatus,
      defaultValue: StateEnum.DEPLOYED,
      control: { type: 'select' },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ background: 'white', padding: '3em' }}>
        <div style={{ width: 16, height: 16 }}>
          <Story />
        </div>
      </div>
    ),
  ],
}

export const Primary = {
  render: (props: StatusChipProps) => <StatusChip {...props} />,
}

export default Story
