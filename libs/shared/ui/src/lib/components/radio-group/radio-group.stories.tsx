import type { Meta } from '@storybook/react'
import { RadioGroup } from './radio-group'

const Story: Meta<typeof RadioGroup.Root> = {
  component: RadioGroup.Root,
  title: 'RadioGroup',
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
    <RadioGroup.Root defaultValue="1">
      <label className="flex gap-3">
        <RadioGroup.Item value="1" /> Value 1
      </label>
      <label className="flex gap-3">
        <RadioGroup.Item value="2" /> Value 2
      </label>
      <label className="flex gap-3">
        <RadioGroup.Item value="3" /> Value 3
      </label>
      <label className="flex gap-3">
        <RadioGroup.Item value="4" disabled /> Value 4
      </label>
      <label className="flex gap-3">
        <RadioGroup.Item value="5" disabled checked /> Value 5
      </label>
    </RadioGroup.Root>
  ),
}

export const Check = {
  render: () => (
    <RadioGroup.Root defaultValue="1">
      <label className="flex gap-3">
        <RadioGroup.Item value="1" variant="check" /> Value 1
      </label>
      <label className="flex gap-3">
        <RadioGroup.Item value="2" variant="check" /> Value 2
      </label>
      <label className="flex gap-3">
        <RadioGroup.Item value="3" variant="check" /> Value 3
      </label>
      <label className="flex gap-3">
        <RadioGroup.Item value="4" disabled variant="check" /> Value 4
      </label>
      <label className="flex gap-3">
        <RadioGroup.Item value="5" disabled checked variant="check" /> Value 5
      </label>
    </RadioGroup.Root>
  ),
}
