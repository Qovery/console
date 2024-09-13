import type { Meta } from '@storybook/react'
import { useState } from 'react'
import { Board, type Column } from './board'

const Story: Meta<typeof Board.Root> = {
  component: Board.Root,
  title: 'Board',
  decorators: [
    (Story) => (
      <div style={{ background: 'white', padding: '3em' }}>
        <Story />
      </div>
    ),
  ],
}

const DEFAULT_DATA: Column[] = [
  {
    columnId: 'backlog',
    title: 'Backlog',
    items: [
      { content: 'Look into render bug in dashboard', id: '1' },
      { content: 'SOX compliance checklist', id: '2' },
      { content: '[SPIKE] Migrate to Azure', id: '3' },
      { content: 'Document Notifications service', id: '4' },
    ],
  },
  {
    columnId: 'todo',
    title: 'TODO',
    items: [
      {
        content: 'Research DB options for new microservice',
        id: '5',
      },
      { content: 'Postmortem for outage', id: '6' },
      { content: 'Sync with product on Q3 roadmap', id: '7' },
    ],
  },
  {
    columnId: 'doing',
    title: 'In progress',
    items: [
      {
        content: 'Refactor context providers to use Zustand',
        id: '8',
      },
      { content: 'Add logging to daily CRON', id: '9' },
    ],
  },
  {
    columnId: 'done',
    title: 'Complete',
    items: [
      {
        content: 'Set up DD dashboards for Lambda listener',
        id: '10',
      },
    ],
  },
]
export const Primary = {
  render: () => {
    const [data, setData] = useState(DEFAULT_DATA)
    return <Board.Root data={data} setData={setData} />
  },
}

export default Story
