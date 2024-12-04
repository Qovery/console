import type { Meta } from '@storybook/react'
import { StateEnum, StepMetricStatusEnum } from 'qovery-typescript-axios'
import { RunningState } from '@qovery/shared/enums'
import { StatusChip, type StatusChipProps } from './status-chip'

const AllStatus = [...Object.values(RunningState), ...Object.values(StateEnum), ...Object.values(StepMetricStatusEnum)]

const Story: Meta<typeof StatusChip> = {
  component: StatusChip,
  title: 'Status/StatusChip',
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
        <div className="inline-flex">
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
