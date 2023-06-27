import type { Meta, StoryObj } from '@storybook/react'
import { InputFilter } from './input-filter'

const meta: Meta<typeof InputFilter> = {
  title: 'Inputs/InputFilter',
  component: InputFilter,
}

export default meta

type Story = StoryObj<typeof InputFilter>

export const Element: Story = {
  args: {
    name: 'Filter',
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ],
    onChange: (value?: string | string[]) => console.log('Selected value:', value),
    defaultValue: 'option1',
  },
}
