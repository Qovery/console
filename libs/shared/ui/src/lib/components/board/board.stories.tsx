import type { Meta } from '@storybook/react'
import { useMemo, useState } from 'react'
import { Board } from './board'

const Story: Meta<typeof Board> = {
  component: Board,
  title: 'Board',
  decorators: [
    (Story) => (
      <div style={{ background: 'white', padding: '3em' }}>
        <Story />
      </div>
    ),
  ],
}

const DEFAULT_DATA = [
  {
    id: 'backlog',
    title: 'Backlog',
    rawItems: [
      { title: 'Look into render bug in dashboard', id: '1' },
      { title: 'SOX compliance checklist', id: '2' },
      { title: '[SPIKE] Migrate to Azure', id: '3' },
      { title: 'Document Notifications service', id: '4' },
    ],
  },
  {
    id: 'todo',
    title: 'TODO',
    rawItems: [
      {
        title: 'Research DB options for new microservice',
        id: '5',
      },
      { title: 'Postmortem for outage', id: '6' },
      { title: 'Sync with product on Q3 roadmap', id: '7' },
    ],
  },
  {
    id: 'doing',
    title: 'In progress',
    rawItems: [
      {
        title: 'Refactor context providers to use Zustand',
        id: '8',
      },
      { title: 'Add logging to daily CRON', id: '9' },
    ],
  },
  {
    id: 'done',
    title: 'Complete',
    rawItems: [
      {
        title: 'Set up DD dashboards for Lambda listener',
        id: '10',
      },
    ],
  },
]
export const Primary = {
  render: () => {
    const [data, setData] = useState(DEFAULT_DATA)
    const boardData = useMemo(
      () =>
        data.map((c) => ({
          ...c,
          columnId: c.id,
          heading: c.title,
          items: c.rawItems.map((i) => ({
            ...i,
            id: i.id,
            content: i.title,
          })),
        })),
      [data]
    )
    return (
      <Board
        data={boardData}
        setData={({ newData }) =>
          setData(
            newData.map((column) => ({
              ...column,
              // As Board component only work in ColumnType props,
              // we must reconcile `items` and `services`
              rawItems: column.items.map(({ id, title }) => ({
                id,
                title,
              })),
            }))
          )
        }
      />
    )
  },
}

export default Story
