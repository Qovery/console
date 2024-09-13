import { motion } from 'framer-motion'
import { Dispatch, type DragEvent, type PropsWithChildren, type ReactNode, type SetStateAction, useState } from 'react'

const BoardRoot = ({ children }: PropsWithChildren) => {
  return <div className="flex h-full w-full gap-3 overflow-scroll p-12">{children}</div>
}

interface Card {
  content: ReactNode
  id: string
  column: string
}

interface BoardColumnProps {
  title: string
  cards: Card[]
  column: string
  setCards: Dispatch<SetStateAction<Card[]>>
}

const BoardColumn = ({ title, cards, column, setCards }: BoardColumnProps) => {
  const [active, setActive] = useState(false)

  const handleDragStart = (e: DragEvent, card: Card) => {
    e.dataTransfer?.setData('cardId', card.id)
  }

  const handleDragEnd = (e: DragEvent) => {
    const cardId = e.dataTransfer?.getData('cardId')

    setActive(false)

    clearHighlights()

    const indicators = getIndicators()

    const { element } = getNearestIndicator(e, indicators)

    const before = element.dataset.before || '-1'

    if (before !== cardId) {
      let copy = [...cards]

      let cardToTransfer = copy.find((c) => c.id === cardId)

      if (!cardToTransfer) return

      cardToTransfer = { ...cardToTransfer, column }

      copy = copy.filter((c) => c.id !== cardId)

      const moveToBack = before === '-1'

      if (moveToBack) {
        copy.push(cardToTransfer)
      } else {
        const insertAtIndex = copy.findIndex((el) => el.id === before)

        if (insertAtIndex === undefined) return

        copy.splice(insertAtIndex, 0, cardToTransfer)
      }

      setCards(copy)
    }
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()

    highlightIndicator(e)

    setActive(true)
  }

  const clearHighlights = (els?: HTMLElement[]) => {
    const indicators = els || getIndicators()

    indicators.forEach((i) => {
      i.style.opacity = '0'
    })
  }

  const highlightIndicator = (e: DragEvent) => {
    const indicators = getIndicators()

    clearHighlights(indicators)

    const el = getNearestIndicator(e, indicators)

    el.element.style.opacity = '1'
  }

  const getNearestIndicator = (e: DragEvent, indicators: HTMLElement[]) => {
    const DISTANCE_OFFSET = 50

    const el = indicators.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect()

        const offset = e.clientY - (box.top + DISTANCE_OFFSET)

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child }
        } else {
          return closest
        }
      },

      {
        offset: Number.NEGATIVE_INFINITY,

        element: indicators[indicators.length - 1],
      }
    )

    return el
  }

  const getIndicators = (): HTMLElement[] => {
    return Array.from(document.querySelectorAll(`[data-column="${column}"]`))
  }

  const handleDragLeave = () => {
    clearHighlights()

    setActive(false)
  }

  const filteredCards = cards.filter((c) => c.column === column)

  return (
    <div className="flex w-60 shrink-0 flex-col rounded">
      <div className="flex h-11 items-center justify-between rounded-t border border-neutral-250 bg-neutral-100 px-3 py-2">
        <h3 className="block truncate text-2xs font-bold text-neutral-400">{title}</h3>

        <span className="rounded text-sm text-neutral-400">{filteredCards.length}</span>
      </div>

      <div
        onDrop={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`h-full w-full rounded-b border border-t-0 border-neutral-250 p-1 transition-colors ${active ? 'bg-green-100' : 'bg-neutral-200'}`}
      >
        {filteredCards.length > 0 ? (
          filteredCards.map((c) => {
            return <BoardCard key={c.id} {...c} handleDragStart={handleDragStart} />
          })
        ) : (
          <div className="px-3 py-6 text-center">
            <i aria-hidden="true" className="fa-solid fa-wave-pulse text-neutral-350"></i>
            <p className="mt-1 text-xs font-medium text-neutral-350">
              No service for this stage. <br /> Please drag and drop a service.
            </p>
          </div>
        )}
        <BoardDropIndicator column={column} />
      </div>
    </div>
  )
}

interface BoardCardProps extends Card {
  handleDragStart: (e: DragEvent, card: Card) => void
}

const BoardCard = ({ content, id, column, handleDragStart }: BoardCardProps) => {
  return (
    <>
      <BoardDropIndicator beforeId={id} column={column} />

      <motion.div
        layout
        layoutId={id}
        draggable="true"
        onDragStart={(e) => handleDragStart(e as unknown as DragEvent, { content, id, column })}
        className="cursor-grab rounded border border-neutral-200 bg-neutral-50 px-2 py-3 active:cursor-grabbing"
      >
        {content}
      </motion.div>
    </>
  )
}

interface BoardDropIndicatorProps {
  beforeId?: string
  column: string
}

const BoardDropIndicator = ({ beforeId, column }: BoardDropIndicatorProps) => {
  return (
    <div data-before={beforeId ?? '-1'} data-column={column} className="my-0.5 h-0.5 w-full bg-violet-400 opacity-0" />
  )
}

const Board = Object.assign(
  {},
  {
    Root: BoardRoot,
    Column: BoardColumn,
    Card: BoardCard,
    Board: BoardDropIndicator,
  }
)

export { Board }
