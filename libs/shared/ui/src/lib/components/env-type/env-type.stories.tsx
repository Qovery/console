import type { Meta } from '@storybook/react-webpack5'
import { EnvType } from './env-type'

const Story: Meta<typeof EnvType> = {
  component: EnvType,
  title: 'EnvType',
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
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <EnvType type="production" size="sm" />
          <span className="text-sm text-neutral-subtle">Production</span>
        </div>
        <div className="flex items-center gap-2">
          <EnvType type="staging" size="sm" />
          <span className="text-sm text-neutral-subtle">Staging</span>
        </div>
        <div className="flex items-center gap-2">
          <EnvType type="development" size="sm" />
          <span className="text-sm text-neutral-subtle">Development</span>
        </div>
        <div className="flex items-center gap-2">
          <EnvType type="ephemeral" size="sm" />
          <span className="text-sm text-neutral-subtle">Ephemeral</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <EnvType type="production" size="lg" />
          <span className="text-sm text-neutral-subtle">Production</span>
        </div>
        <div className="flex items-center gap-2">
          <EnvType type="staging" size="lg" />
          <span className="text-sm text-neutral-subtle">Staging</span>
        </div>
        <div className="flex items-center gap-2">
          <EnvType type="development" size="lg" />
          <span className="text-sm text-neutral-subtle">Development</span>
        </div>
        <div className="flex items-center gap-2">
          <EnvType type="ephemeral" size="lg" />
          <span className="text-sm text-neutral-subtle">Ephemeral</span>
        </div>
      </div>
    </div>
  ),
}
