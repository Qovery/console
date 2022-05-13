import { StatusMenu, StatusMenuProps } from './status-menu'
import { Meta, Story } from '@storybook/react'
import { select } from '@storybook/addon-knobs'
import { GlobalDeploymentStatus } from 'qovery-typescript-axios'

export default {
  component: StatusMenu,
  title: 'Status menu',
} as Meta

const Template: Story<StatusMenuProps> = (args) => <StatusMenu {...args} status={GlobalDeploymentStatus.RUNNING} />

export const Primary = Template.bind({})

Primary.args = {
  status: select('Status', GlobalDeploymentStatus, GlobalDeploymentStatus.RUNNING),
}
