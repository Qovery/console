import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { ChartLegend } from './chart-legend'

const meta: Meta<typeof ChartLegend> = {
  title: 'Chart/Legend',
  component: ChartLegend,
  parameters: {
    docs: {
      description: {
        component:
          'A reusable chart legend component with interactive selection and horizontal scrolling capabilities.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ background: 'white', padding: '2em', maxWidth: '600px' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ChartLegend>

const sampleItems = [
  { key: 'cpu', label: 'CPU Usage', color: '#ff6b35' },
  { key: 'memory', label: 'Memory Usage', color: '#4ecdc4' },
  { key: 'disk', label: 'Disk Usage', color: '#45b7d1' },
  { key: 'network', label: 'Network I/O', color: '#96ceb4' },
]

export const Basic: Story = {
  args: {
    items: sampleItems,
  },
}

export const WithSelection: Story = {
  render: () => {
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set(['cpu', 'memory']))

    return (
      <ChartLegend
        items={sampleItems}
        selectedKeys={selectedKeys}
        onToggle={(key) => {
          setSelectedKeys((prev) => {
            const next = new Set(prev)
            if (next.has(key)) {
              next.delete(key)
            } else {
              next.add(key)
            }
            return next
          })
        }}
      />
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Legend with interactive selection. Click on legend items to toggle their selection state.',
      },
    },
  },
}

export const WithHighlighting: Story = {
  render: () => {
    const [highlightedKey, setHighlightedKey] = useState<string | null>(null)

    return (
      <div>
        <p className="mb-4 text-sm text-gray-600">
          {highlightedKey ? `Highlighted: ${highlightedKey}` : 'Hover over legend items to see highlighting'}
        </p>
        <ChartLegend items={sampleItems} onHighlight={(key) => setHighlightedKey(key)} />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Legend with hover highlighting. Mouse over legend items to see the highlighting effect.',
      },
    },
  },
}

export const ManyItems: Story = {
  render: () => (
    <ChartLegend
      items={Array.from({ length: 20 }, (_, i) => ({
        key: `metric-${i}`,
        label: `Metric ${i + 1} with a very long name that should be truncated`,
        color: `hsl(${(i * 18) % 360}, 70%, 50%)`,
      }))}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Legend with many items demonstrating horizontal scrolling. Use mouse wheel to scroll horizontally.',
      },
    },
  },
}

export const InteractiveExample: Story = {
  render: () => {
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
    const [highlightedKey, setHighlightedKey] = useState<string | null>(null)

    return (
      <div>
        <div className="mb-4 space-y-2 text-sm text-gray-600">
          <p>Selected: {selectedKeys.size > 0 ? Array.from(selectedKeys).join(', ') : 'None'}</p>
          <p>Highlighted: {highlightedKey || 'None'}</p>
        </div>
        <ChartLegend
          items={sampleItems}
          selectedKeys={selectedKeys}
          onToggle={(key) => {
            setSelectedKeys((prev) => {
              const next = new Set(prev)
              if (next.has(key)) {
                next.delete(key)
              } else {
                next.add(key)
              }
              return next
            })
          }}
          onHighlight={(key) => setHighlightedKey(key)}
        />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive example showing both selection and highlighting functionality with state display.',
      },
    },
  },
}
