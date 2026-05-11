import type { Meta } from '@storybook/react-webpack5'
import { Checkbox, type CheckboxProps } from './checkbox'

const Story: Meta<typeof Checkbox> = {
  component: Checkbox,
  title: 'Checkbox',
  argTypes: {
    color: {
      control: { type: 'radio' },
      options: ['brand', 'red'],
    },
  },
  args: {
    color: 'brand',
  },
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
  render: (args: CheckboxProps) => (
    <>
      <label className="flex items-center gap-2">
        <Checkbox {...args} />
        Not checked
      </label>
      <label className="flex items-center gap-2">
        <Checkbox {...args} defaultChecked />
        Checked
      </label>
      <label className="flex items-center gap-2">
        <Checkbox {...args} checked="indeterminate" /> Indeterminate
      </label>
      <label className="flex items-center gap-2">
        <Checkbox {...args} disabled /> Not checked
      </label>
      <label className="flex items-center gap-2">
        <Checkbox {...args} disabled defaultChecked /> Checked
      </label>
      <label className="flex items-center gap-2">
        <Checkbox {...args} disabled checked="indeterminate" /> Indeterminate
      </label>
    </>
  ),
}
