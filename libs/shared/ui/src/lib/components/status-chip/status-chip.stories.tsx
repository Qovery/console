import { ComponentMeta, ComponentStory } from '@storybook/react'
import { StateEnum } from 'qovery-typescript-axios'
import { RunningStatus } from '@qovery/shared/enums'
import { StatusChip } from './status-chip'

const AllStatus = [...Object.values(RunningStatus), ...Object.values(StateEnum)]

export default {
  component: StatusChip,
  title: 'StatusChip',
  argTypes: {
    status: {
      options: AllStatus,
      control: { type: 'select' },
    },
  },
} as ComponentMeta<typeof StatusChip>

const Template: ComponentStory<typeof StatusChip> = (args) => <StatusChip {...args} />

export const Primary = Template.bind({})
Primary.args = {
  status: RunningStatus.ERROR,
  appendTooltipMessage: '',
  className: '',
}
