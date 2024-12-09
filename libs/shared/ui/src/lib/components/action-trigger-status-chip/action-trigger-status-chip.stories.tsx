import type { Meta } from '@storybook/react'
import { StateEnum } from 'qovery-typescript-axios'
import { ActionTriggerStatusChip, type ActionTriggerStatusChipInterface } from './action-trigger-status-chip'

const Story: Meta<typeof ActionTriggerStatusChip> = {
  component: ActionTriggerStatusChip,
  title: 'Status/ActionTriggerStatusChip',
  argTypes: {
    triggerAction: {
      defaultValue: 'DEPLOY',
      control: { type: 'select' },
      options: ['DELETE', 'DEPLOY', 'RESTART', 'STOP'],
    },
    status: {
      defaultValue: StateEnum.DEPLOYED,
      options: [...Object.values(StateEnum)],
      control: { type: 'select' },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ background: 'white', padding: '3em' }}>
        <Story />
      </div>
    ),
  ],
}

export const Primary = {
  render: (props: ActionTriggerStatusChipInterface) => <ActionTriggerStatusChip {...props} />,
}

export default Story
