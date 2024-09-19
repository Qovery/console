import { motion } from 'framer-motion'
import { type DragEvent, type MutableRefObject, type ReactNode, useId, useRef, useState } from 'react'

/**
 * Inspired by https://www.youtube.com/watch?v=O5lZqqy7VQE
 * https://www.hover.dev/components/boards
 * https://codesandbox.io/p/sandbox/fvy4m4
 *
 * NOTE: This component doesn't follow the "compound pattern" as
 * - it requires complex typing
 * - it needs to pass props to child components like drag n drop handles
 * - it is rarely used so no big of a need to be highly configurable
 * However in the future it can be turn into a compound pattern using a react context
 */

type SetData<T extends ColumnType> = ({
  sourceColumnId,
  sourceCardId,
  targetColumnId,
  targetCardId,
  after,
  newData,
}: {
  sourceColumnId: string
  sourceCardId?: string
  targetColumnId: string
  targetCardId?: string
  after?: boolean
  newData: T[]
}) => void

const Board = <T extends ColumnType>({
  data,
  setData,
  showCardIndicator = true,
  emptyState = null,
}: {
  data: T[]
  setData: SetData<T>
  showCardIndicator?: boolean
  emptyState?: ReactNode
}) => {
  const instanceId = useId()
  // Here we need a custom dataTransfer object as the event.dataTransfer are not always
  // propagated to all event listeners depending on browsers
  // https://stackoverflow.com/a/71900807
  const dataTransfer = useRef<{ columnId?: string; cardId?: string } | null>(null)

  return (
    <div className="flex h-full w-full overflow-scroll pb-5">
      {data.map((column) => (
        <Column
          key={column.columnId}
          column={column}
          data={data}
          setData={setData}
          boardId={instanceId}
          showCardIndicator={showCardIndicator}
          emptyState={emptyState}
          dataTransfer={dataTransfer}
        />
      ))}
      <ColumnDropIndicator boardId={instanceId} />
    </div>
  )
}

interface CardType {
  content: ReactNode
  id: string
}

export interface ColumnType {
  columnId: string
  heading: ReactNode
  items: CardType[]
}

interface ColumnProps<T extends ColumnType> {
  column: T
  data: T[]
  setData: SetData<T>
  boardId: string
  showCardIndicator: boolean
  emptyState: ReactNode
  dataTransfer: MutableRefObject<{
    columnId?: string
    cardId?: string
  } | null>
}

const Column = <T extends ColumnType>({
  column,
  data,
  setData,
  boardId,
  showCardIndicator,
  emptyState,
  dataTransfer,
}: ColumnProps<T>) => {
  const [active, setActive] = useState(false)

  /**
   * Column
   */
  const handleColumnDragStart = (columnId: string) => {
    dataTransfer.current = { columnId, cardId: undefined }
  }

  const handleColumnDragEnd = (e: DragEvent) => {
    const columnId = dataTransfer.current?.columnId

    const indicators = getColumnIndicators()

    clearHighlights(indicators)
    dataTransfer.current = null

    const { element } = getNearestColumnIndicator(e, indicators)

    const before = element.dataset['before'] || '-1'

    if (before !== columnId) {
      let copy = [...data]

      let columnToTransfer = copy.find((c) => c.columnId === columnId)

      if (!columnToTransfer) return

      columnToTransfer = { ...columnToTransfer }

      copy = copy.filter((c) => c.columnId !== columnId)

      const moveToBack = before === '-1'

      if (moveToBack) {
        const targetColumnId = copy[copy.length - 1].columnId
        copy.push(columnToTransfer)

        setData({
          targetColumnId,
          sourceColumnId: columnToTransfer.columnId,
          newData: copy,
          after: true,
        })
      } else {
        const insertAtIndex = copy.findIndex((el) => el.columnId === before)

        if (insertAtIndex === undefined) return

        copy.splice(insertAtIndex, 0, columnToTransfer)

        setData({ targetColumnId: before, sourceColumnId: columnToTransfer.columnId, newData: copy, after: false })
      }
    }
  }

  const getColumnIndicators = (): HTMLElement[] => {
    return Array.from(document.querySelectorAll(`[data-board="${boardId}"]:not([data-column])`))
  }

  const getNearestColumnIndicator = (e: DragEvent, indicators: HTMLElement[]) => {
    const DISTANCE_OFFSET = 50

    const el = indicators.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect()

        const offset = e.clientX - (box.left + DISTANCE_OFFSET)

        if (offset < 0 && offset > closest.offset) {
          return { offset, element: child }
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

  const highlightColumnIndicator = (e: DragEvent) => {
    const indicators = getColumnIndicators()

    clearHighlights(indicators)

    const el = getNearestColumnIndicator(e, indicators)

    el.element.style.opacity = '1'
  }

  /**
   * Card
   */
  const handleCardDragStart = (e: DragEvent, card: CardType, columnId: string) => {
    e.stopPropagation()
    dataTransfer.current = { columnId, cardId: card.id }
  }

  const handleCardDragEnd = (e: DragEvent, targetColumnId: string) => {
    e.stopPropagation()

    const cardId = dataTransfer.current?.cardId
    const columnId = dataTransfer.current?.columnId

    setActive(false)

    const indicators = getCardIndicators()

    clearHighlights(indicators)
    dataTransfer.current = null

    if (!cardId || !columnId) {
      return
    }

    const { element } = getNearestCardIndicator(e, indicators)

    const before = element.dataset['before'] || '-1'

    if (columnId === targetColumnId && before === cardId) {
      // drag without move
      return
    }

    const { columns: copy, cardToTransfer } = structuredClone(
      // Remove JSX before cloning the data
      data.map(({ heading, items, ...column }) => ({
        ...column,
        heading: null,
        items: items.map(({ content, ...item }) => ({
          content: null,
          ...item,
        })),
      }))
    ).reduce<{
      columns: T[]
      cardToTransfer: CardType | undefined
    }>(
      (acc, col) => {
        if (col.columnId !== columnId) {
          acc.columns.push(col as T)
          return acc
        }
        acc.cardToTransfer = col.items.find((c) => c.id === cardId)
        col.items = col.items.filter((c) => c.id !== cardId)
        acc.columns.push(col as T)
        return acc
      },
      { columns: [], cardToTransfer: undefined }
    )

    if (!cardToTransfer) {
      throw Error('Unknown cardId')
    }

    const newData = copy.map((col) => {
      if (col.columnId !== targetColumnId) {
        return col
      }

      const moveToBack = before === '-1'

      if (moveToBack) {
        col.items.push(cardToTransfer)
      } else {
        const insertAtIndex = col.items.findIndex((el) => el.id === before)

        if (insertAtIndex === undefined) {
          throw Error('Unknown insert index')
        }

        col.items.splice(insertAtIndex, 0, cardToTransfer)
      }
      return col
    })

    const targetColumnItems = copy.find(({ columnId }) => columnId === targetColumnId)?.items ?? []
    setData({
      sourceColumnId: columnId,
      sourceCardId: cardId,
      targetColumnId,
      targetCardId: before === '-1' ? targetColumnItems[targetColumnItems.length - 1].id : before,
      after: before === '-1',
      newData,
    })
  }

  const handleCardDragOver = (e: DragEvent) => {
    e.preventDefault()

    const cardId = dataTransfer.current?.cardId
    const columnId = dataTransfer.current?.columnId

    if (columnId) {
      if (cardId) {
        highlightCardIndicator(e)
        setActive(true)
      } else {
        highlightColumnIndicator(e)
      }
    }
  }

  const clearHighlights = (els?: HTMLElement[]) => {
    const indicators = els || [...getCardIndicators(), ...getColumnIndicators()]

    indicators.forEach((i) => {
      i.style.opacity = '0'
    })
  }

  const highlightCardIndicator = (e: DragEvent) => {
    const indicators = getCardIndicators()

    clearHighlights(indicators)

    if (showCardIndicator) {
      const el = getNearestCardIndicator(e, indicators)

      el.element.style.opacity = '1'
    }
  }

  const getNearestCardIndicator = (e: DragEvent, indicators: HTMLElement[]) => {
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

  const getCardIndicators = (): HTMLElement[] => {
    return Array.from(document.querySelectorAll(`[data-board="${boardId}"][data-column="${column.columnId}"]`))
  }

  const handleCardDragLeave = () => {
    clearHighlights()

    setActive(false)
  }

  const filteredCards = column.items

  return (
    <motion.div
      layout
      layoutId={column.columnId}
      className="flex flex-row"
      onDrop={(e) => handleColumnDragEnd(e)}
      onDragOver={handleCardDragOver}
      onDragLeave={handleCardDragLeave}
    >
      <ColumnDropIndicator beforeId={column.columnId} boardId={boardId} />

      <div className="relative flex w-60 shrink-0 flex-col rounded">
        {column !== data[data.length - 1] && (
          <svg
            data-testid={`arrow-${column.columnId}`}
            className="absolute left-full shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="43"
            fill="none"
            viewBox="0 0 16 43"
          >
            <path fill="#C6D3E7" d="M16 21.5l-7.5-4.33v8.66L16 21.5zm-16 .75h9.25v-1.5H0v1.5z"></path>
          </svg>
        )}
        <div draggable onDragStart={() => handleColumnDragStart(column.columnId)} className="flex flex-col">
          <div className="flex h-11 cursor-grab items-center justify-between rounded-t border border-neutral-250 bg-neutral-100 px-3 py-2 active:cursor-grabbing">
            {column.heading}
          </div>

          <div
            onDrop={(e) => handleCardDragEnd(e, column.columnId)}
            onDragOver={handleCardDragOver}
            onDragLeave={handleCardDragLeave}
            className={`w-full rounded-b border border-t-0 border-neutral-250 px-1 transition-colors ${active ? 'bg-green-100' : 'bg-neutral-200'}`}
          >
            {filteredCards.length > 0
              ? filteredCards.map((card) => {
                  return (
                    <Card
                      key={card.id}
                      columnId={column.columnId}
                      boardId={boardId}
                      {...card}
                      handleDragStart={handleCardDragStart}
                    />
                  )
                })
              : emptyState}
            <CardDropIndicator columnId={column.columnId} boardId={boardId} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

interface CardProps extends CardType {
  columnId: string
  boardId: string
  handleDragStart: (e: DragEvent, card: CardType, columnId: string) => void
}

const Card = ({ columnId, handleDragStart, boardId, ...card }: CardProps) => {
  const { id, content } = card
  return (
    <>
      <CardDropIndicator beforeId={id} columnId={columnId} boardId={boardId} />

      <motion.div
        layout
        layoutId={id}
        draggable
        onDragStart={(e) => {
          // Force cast "e" to DragEvent due to wrong typing in framer-motion
          handleDragStart(e as unknown as DragEvent, card, columnId)
        }}
        className="cursor-grab rounded border border-neutral-200 bg-neutral-50 px-2 py-3 active:cursor-grabbing"
      >
        {content}
      </motion.div>
    </>
  )
}

interface CardDropIndicatorProps {
  beforeId?: string
  columnId: string
  boardId: string
}

const CardDropIndicator = ({ beforeId, columnId, boardId }: CardDropIndicatorProps) => {
  return (
    <div
      data-before={beforeId ?? '-1'}
      data-board={boardId}
      data-column={columnId}
      className="my-0.5 h-0.5 w-full bg-violet-400 opacity-0"
    />
  )
}

interface ColumnDropIndicatorProps {
  beforeId?: string
  boardId: string
}

const ColumnDropIndicator = ({ beforeId, boardId }: ColumnDropIndicatorProps) => {
  return (
    <div data-before={beforeId ?? '-1'} data-board={boardId} className="mx-2 h-full w-0.5 bg-brand-500 opacity-0" />
  )
}

export { Board }
export default Board
