import type { Meta } from '@storybook/react'
import { useState } from 'react'
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

const DEFAULT_CARDS = [
  // BACKLOG

  { content: 'Look into render bug in dashboard', cardId: '1', columnId: 'backlog' },

  { content: 'SOX compliance checklist', cardId: '2', columnId: 'backlog' },

  { content: '[SPIKE] Migrate to Azure', cardId: '3', columnId: 'backlog' },

  { content: 'Document Notifications service', cardId: '4', columnId: 'backlog' },

  // TODO

  {
    content: 'Research DB options for new microservice',

    cardId: '5',

    columnId: 'todo',
  },

  { content: 'Postmortem for outage', cardId: '6', columnId: 'todo' },

  { content: 'Sync with product on Q3 roadmap', cardId: '7', columnId: 'todo' },

  // DOING

  {
    content: 'Refactor context providers to use Zustand',

    cardId: '8',

    columnId: 'doing',
  },

  { content: 'Add logging to daily CRON', cardId: '9', columnId: 'doing' },

  // DONE

  {
    content: 'Set up DD dashboards for Lambda listener',

    cardId: '10',

    columnId: 'done',
  },
]
export const Primary = {
  render: () => {
    const [cards, setCards] = useState(DEFAULT_CARDS)
    return (
      <Board.Root className="gap-2">
        <Board.Column heading="Backlog" columnId="backlog" data={cards} setData={({ newData }) => setCards(newData)}>
          {cards
            .filter(({ columnId }) => columnId === 'backlog')
            .map(({ cardId, columnId, content }) => (
              <Board.Card key={cardId} cardId={cardId} columnId={columnId}>
                {content}
              </Board.Card>
            ))}
        </Board.Column>
        <Board.Column heading="TODO" columnId="todo" data={cards} setData={({ newData }) => setCards(newData)}>
          {cards
            .filter(({ columnId }) => columnId === 'todo')
            .map(({ cardId, columnId, content }) => (
              <Board.Card key={cardId} cardId={cardId} columnId={columnId}>
                {content}
              </Board.Card>
            ))}
        </Board.Column>
        <Board.Column heading="In progress" columnId="doing" data={cards} setData={({ newData }) => setCards(newData)}>
          {cards
            .filter(({ columnId }) => columnId === 'doing')
            .map(({ cardId, columnId, content }) => (
              <Board.Card key={cardId} cardId={cardId} columnId={columnId}>
                {content}
              </Board.Card>
            ))}
        </Board.Column>
        <Board.Column heading="Complete" columnId="done" data={cards} setData={({ newData }) => setCards(newData)}>
          {cards
            .filter(({ columnId }) => columnId === 'done')
            .map(({ cardId, columnId, content }) => (
              <Board.Card key={cardId} cardId={cardId} columnId={columnId}>
                {content}
              </Board.Card>
            ))}
        </Board.Column>
      </Board.Root>
    )
  },
}

export default Story
