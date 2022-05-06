import { StatusMenuAction, StatusMenuActionProps } from './status-menu-action'
import { select } from '@storybook/addon-knobs'
import { Meta, Story } from '@storybook/react'
import { GlobalDeploymentStatus } from 'qovery-typescript-axios'
import { Button } from '@console/shared/ui'

export default {
  component: StatusMenuAction,
  title: 'Status menu action',
} as Meta

const Template: Story<StatusMenuActionProps> = (args) => <StatusMenuAction {...args} />

export const Primary = Template.bind({})

Primary.args = {
  status: select('Size', GlobalDeploymentStatus, GlobalDeploymentStatus.DEPLOYED),
  trigger: <Button>Menu action</Button>,
}
