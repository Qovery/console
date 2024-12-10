import type { Meta } from '@storybook/react'
import { StageStatusEnum } from 'qovery-typescript-axios'
import { StageStatusChip, type StageStatusChipProps } from './stage-status-chip'

const Story: Meta<typeof StageStatusChip> = {
  component: StageStatusChip,
  title: 'Status/StageStatusChip',
  argTypes: {
    status: {
      options: [...Object.values(StageStatusEnum)],
      control: { type: 'select' },
    },
  },
  args: {
    status: StageStatusEnum.ONGOING,
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
  render: (props: StageStatusChipProps) => <StageStatusChip {...props} />,
}

export default Story
