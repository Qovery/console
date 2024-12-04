import type { Meta } from '@storybook/react'
import { StateEnum } from 'qovery-typescript-axios'
import { StatusLabel, type StatusLabelProps } from './status-label'

const AllStatus = [...Object.values(StateEnum)]

const Story: Meta<typeof StatusLabel> = {
  component: StatusLabel,
  title: 'Status/StatusLabel',
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
  render: (props: StatusLabelProps) => <StatusLabel {...props} />,
}

export default Story
