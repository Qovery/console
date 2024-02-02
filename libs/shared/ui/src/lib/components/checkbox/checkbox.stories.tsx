import type { Meta } from '@storybook/react'
import { Checkbox } from './checkbox'

const Story: Meta<typeof Checkbox> = {
  component: Checkbox,
  title: 'Checkbox',
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
    <>
      <label className="flex items-center gap-3">
        <Checkbox />
        Not checked
      </label>
      <label className="flex items-center gap-3">
        <Checkbox defaultChecked />
        Checked
      </label>
      <label className="flex items-center gap-3">
        <Checkbox checked="indeterminate" /> Indeterminate
      </label>
      <label className="flex items-center gap-3">
        <Checkbox disabled /> Not checked
      </label>
      <label className="flex items-center gap-3">
        <Checkbox disabled defaultChecked /> Checked
      </label>
      <label className="flex items-center gap-3">
        <Checkbox disabled checked="indeterminate" /> Indeterminate
      </label>
    </>
  ),
}
