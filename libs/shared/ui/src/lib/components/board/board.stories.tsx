import type { Meta } from '@storybook/react'
import { ReactNode, useState } from 'react'
import { Board } from './board'

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

const DEFAULT_CARDS: {
  content: ReactNode
  id: string
  column: string
}[] = [
  // BACKLOG

  { content: 'Look into render bug in dashboard', id: '1', column: 'backlog' },

  { content: 'SOX compliance checklist', id: '2', column: 'backlog' },

  { content: '[SPIKE] Migrate to Azure', id: '3', column: 'backlog' },

  { content: 'Document Notifications service', id: '4', column: 'backlog' },

  // TODO

  {
    content: 'Research DB options for new microservice',

    id: '5',

    column: 'todo',
  },

  { content: 'Postmortem for outage', id: '6', column: 'todo' },

  { content: 'Sync with product on Q3 roadmap', id: '7', column: 'todo' },

  // DOING

  {
    content: 'Refactor context providers to use Zustand',

    id: '8',

    column: 'doing',
  },

  { content: 'Add logging to daily CRON', id: '9', column: 'doing' },

  // DONE

  {
    content: 'Set up DD dashboards for Lambda listener',

    id: '10',

    column: 'done',
  },
]
export const Primary = {
  render: () => {
    const [cards, setCards] = useState(DEFAULT_CARDS)
    return (
      <Board.Root>
        <Board.Column title="Backlog" column="backlog" cards={cards} setCards={setCards} />
        <Board.Column title="TODO" column="todo" cards={cards} setCards={setCards} />
        <Board.Column title="In progress" column="doing" cards={cards} setCards={setCards} />
        <Board.Column title="Complete" column="done" cards={cards} setCards={setCards} />
      </Board.Root>
    )
  },
}

export default Story
