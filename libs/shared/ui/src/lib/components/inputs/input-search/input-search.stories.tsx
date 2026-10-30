import { type Meta, type StoryObj } from '@storybook/react-webpack5'
import { useState } from 'react'
import { InputSearch } from './input-search'

const meta: Meta<typeof InputSearch> = {
  component: InputSearch,
  title: 'Inputs/InputSearch',
  args: { ariaLabel: 'Search', placeholder: 'Search…' },
}

export default meta

type Story = StoryObj<typeof InputSearch>

export const Default: Story = {}
export const Compact: Story = { args: { size: 'sm' } }
export const CompactWithValue: Story = {
  args: { size: 'sm', value: 'Loki' },
  render: function CompactWithValueStory(args) {
    const [value, setValue] = useState(args.value)
    return <InputSearch {...args} value={value} onChange={setValue} />
  },
}
