import type { Meta } from '@storybook/react'
import { Tabs } from './tabs-primitives'

const Story: Meta<typeof Tabs.Root> = {
  component: Tabs.Root,
  title: 'Tabs Primitives',
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
    <div className="flex flex-col gap-3">
      {['xs' as const, 'md' as const].map((size) =>
        ['none' as const, 'full' as const].map((radius) =>
          ['' as const, 'dark bg-neutral-550' as const].map((theme) => (
            <div key={`${size}${radius}${theme}`} className={`p-3 ${theme}`}>
              <Tabs.Root defaultValue="account">
                <Tabs.List>
                  <Tabs.Trigger size={size} radius={radius} value="account">
                    Account
                  </Tabs.Trigger>
                  <Tabs.Trigger size={size} radius={radius} value="documents">
                    Documents
                  </Tabs.Trigger>
                  <Tabs.Trigger size={size} radius={radius} value="settings">
                    Settings
                  </Tabs.Trigger>
                  <Tabs.Trigger size={size} radius={radius} value="disabled" disabled>
                    Disabled
                  </Tabs.Trigger>
                </Tabs.List>
                <div className={theme.split(' ').includes('dark') ? 'mt-2 text-white' : 'mt-2'}>
                  <Tabs.Content value="account">
                    <span>Make changes to your account.</span>
                  </Tabs.Content>

                  <Tabs.Content value="documents">
                    <span>Access and update your documents.</span>
                  </Tabs.Content>

                  <Tabs.Content value="settings">
                    <span>Edit your profile or update contact information.</span>
                  </Tabs.Content>
                </div>
              </Tabs.Root>
            </div>
          ))
        )
      )}
    </div>
  ),
}
