import type { Meta } from '@storybook/react'
import { Button } from '../button/button'
import { Icon } from '../icon/icon'
import { Callout } from './callout'

const Story: Meta<typeof Callout.Root> = {
  component: Callout.Root,
  title: 'Callout',
  decorators: [
    (Story) => (
      <div style={{ background: 'white', padding: '3em' }}>
        <Story />
      </div>
    ),
  ],
}
export default Story

export const Primary = {
  render: () => (
    <Callout.Root color="green">
      <Callout.Icon>
        <Icon iconName="triangle-exclamation" iconStyle="regular" />
      </Callout.Icon>
      <Callout.Text>
        <Callout.TextHeading>Lorem ipsum</Callout.TextHeading>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
        consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
        pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
        laborum.
      </Callout.Text>
    </Callout.Root>
  ),
}

export const Secondary = {
  render: () => (
    <Callout.Root color="sky">
      <Callout.Icon>
        <Icon iconName="triangle-exclamation" iconStyle="regular" />
      </Callout.Icon>
      <Callout.Text>
        <Callout.TextHeading>Lorem ipsum</Callout.TextHeading>
        Lorem ipsum dolor sit amet
      </Callout.Text>
    </Callout.Root>
  ),
}

export const WithButtons = {
  render: () => (
    <Callout.Root color="red">
      <Callout.Icon>
        <Icon iconName="triangle-exclamation" />
      </Callout.Icon>
      <Callout.Text>
        <Callout.TextHeading>Lorem ipsum</Callout.TextHeading>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
        consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
        pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
        laborum.
      </Callout.Text>
      <div className="flex flex-row gap-1.5">
        <Button type="button" color="neutral" variant="outline">
          <Icon className="px-1" iconName="chevron-left" />
        </Button>
        <Button type="button" color="neutral" variant="outline">
          <Icon className="px-1" iconName="chevron-right" />
        </Button>
      </div>
    </Callout.Root>
  ),
}
