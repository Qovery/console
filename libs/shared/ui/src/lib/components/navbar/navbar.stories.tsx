import { type Meta, type StoryObj } from '@storybook/react-webpack5'
import { useState } from 'react'
import { Icon } from '../icon/icon'
import { Navbar } from './navbar'

const meta: Meta<typeof Navbar.Root> = {
  component: Navbar.Root,
  title: 'Navbar',
  decorators: [
    (Story) => (
      <div style={{ background: 'white', minHeight: '200px' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof Navbar.Root>

export const Primary: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState('projects')

    return (
      <Navbar.Root activeId={activeTab}>
        <Navbar.Item
          id="projects"
          href="#"
          onClick={(e) => {
            e.preventDefault()
            setActiveTab('projects')
          }}
        >
          <Icon iconName="cube" iconStyle="regular" />
          Projects
        </Navbar.Item>
        <Navbar.Item
          id="integrations"
          href="#"
          onClick={(e) => {
            e.preventDefault()
            setActiveTab('integrations')
          }}
        >
          Integrations
        </Navbar.Item>
        <Navbar.Item
          id="deployments"
          href="#"
          onClick={(e) => {
            e.preventDefault()
            setActiveTab('deployments')
          }}
        >
          <Icon iconName="cube" iconStyle="regular" />
          Deployments
        </Navbar.Item>
        <Navbar.Item
          id="activity"
          href="#"
          onClick={(e) => {
            e.preventDefault()
            setActiveTab('activity')
          }}
        >
          <Icon iconName="cube" iconStyle="regular" />
          Activity
        </Navbar.Item>
        <Navbar.Item
          id="domains"
          href="#"
          onClick={(e) => {
            e.preventDefault()
            setActiveTab('domains')
          }}
        >
          Domains
        </Navbar.Item>
        <Navbar.Item
          id="observability"
          href="#"
          onClick={(e) => {
            e.preventDefault()
            setActiveTab('observability')
          }}
        >
          <Icon iconName="cube" iconStyle="regular" />
          Observability
        </Navbar.Item>
        <Navbar.Item
          id="storage"
          href="#"
          onClick={(e) => {
            e.preventDefault()
            setActiveTab('storage')
          }}
        >
          <Icon iconName="cube" iconStyle="regular" />
          Storage
        </Navbar.Item>
      </Navbar.Root>
    )
  },
}

export const WithLinks: Story = {
  render: () => (
    <Navbar.Root activeId="deployments">
      <Navbar.Item id="projects" href="/projects">
        <Icon iconName="cube" iconStyle="regular" />
        Projects
      </Navbar.Item>
      <Navbar.Item id="integrations" href="/integrations">
        <Icon iconName="cube" iconStyle="regular" />
        Integrations
      </Navbar.Item>
      <Navbar.Item id="deployments" href="/deployments">
        <Icon iconName="cube" iconStyle="regular" />
        Deployments
      </Navbar.Item>
      <Navbar.Item id="activity" href="/activity">
        <Icon iconName="cube" iconStyle="regular" />
        Activity
      </Navbar.Item>
      <Navbar.Item id="domains" href="/domains">
        <Icon iconName="cube" iconStyle="regular" />
        Domains
      </Navbar.Item>
    </Navbar.Root>
  ),
}

export const ManyItems: Story = {
  render: () => (
    <Navbar.Root activeId="item5">
      <Navbar.Item id="item1" href="#">
        <Icon iconName="cube" iconStyle="regular" />
        Item 1
      </Navbar.Item>
      <Navbar.Item id="item2" href="#">
        <Icon iconName="cube" iconStyle="regular" />
        Item 2
      </Navbar.Item>
      <Navbar.Item id="item3" href="#">
        <Icon iconName="cube" iconStyle="regular" />
        Item 3
      </Navbar.Item>
      <Navbar.Item id="item4" href="#">
        <Icon iconName="cube" iconStyle="regular" />
        Item 4
      </Navbar.Item>
      <Navbar.Item id="item5" href="#">
        <Icon iconName="cube" iconStyle="regular" />
        Item 5
      </Navbar.Item>
      <Navbar.Item id="item6" href="#">
        <Icon iconName="cube" iconStyle="regular" />
        Item 6
      </Navbar.Item>
      <Navbar.Item id="item7" href="#">
        <Icon iconName="cube" iconStyle="regular" />
        Item 7
      </Navbar.Item>
      <Navbar.Item id="item8" href="#">
        <Icon iconName="cube" iconStyle="regular" />
        Item 8
      </Navbar.Item>
      <Navbar.Item id="item9" href="#">
        <Icon iconName="cube" iconStyle="regular" />
        Item 9
      </Navbar.Item>
      <Navbar.Item id="item10" href="#">
        <Icon iconName="cube" iconStyle="regular" />
        Item 10
      </Navbar.Item>
      <Navbar.Item id="item11" href="#">
        <Icon iconName="cube" iconStyle="regular" />
        Item 11
      </Navbar.Item>
      <Navbar.Item id="item12" href="#">
        <Icon iconName="cube" iconStyle="regular" />
        Item 12
      </Navbar.Item>
    </Navbar.Root>
  ),
}
