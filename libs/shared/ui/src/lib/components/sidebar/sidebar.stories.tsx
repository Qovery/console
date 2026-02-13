import { type Meta, type StoryObj } from '@storybook/react-webpack5'
import { Sidebar } from './sidebar'

const meta: Meta<typeof Sidebar.Root> = {
  component: Sidebar.Root,
  title: 'Sidebar',
}

export default meta

type Story = StoryObj<typeof Sidebar.Root>

export const Primary: Story = {
  render: () => (
    <Sidebar.Root>
      <Sidebar.Item to="/service-configuration" icon="gear">
        Service configuration
      </Sidebar.Item>
      <Sidebar.Item to="/resources" icon="server">
        Resources
      </Sidebar.Item>
      <Sidebar.Item to="/storage" icon="database">
        Storage
      </Sidebar.Item>
      <Sidebar.Item to="/ports" icon="plug">
        Ports
      </Sidebar.Item>
      <Sidebar.Item to="/domains" icon="globe">
        Domains
      </Sidebar.Item>
      <Sidebar.Item to="/health-check" icon="shield-check" badge="new">
        Health check
      </Sidebar.Item>
      <Sidebar.Group title="Deployment restrictions" icon="shield" defaultOpen>
        <Sidebar.SubItem to="/deployment-restriction/general">General</Sidebar.SubItem>
        <Sidebar.SubItem to="/deployment-restrictions/rules">Rules</Sidebar.SubItem>
        <Sidebar.SubItem to="/deployment-restrictions/advanced" badge="new" active>
          Advanced
        </Sidebar.SubItem>
      </Sidebar.Group>
      <Sidebar.Group title="Advanced settings" icon="gears">
        <Sidebar.SubItem to="/advanced-settings-general">General</Sidebar.SubItem>
        <Sidebar.SubItem to="/advanced-settings-security">Security</Sidebar.SubItem>
      </Sidebar.Group>
      <Sidebar.Item to="/danger-zone" icon="skull">
        Danger zone
      </Sidebar.Item>
    </Sidebar.Root>
  ),
}
