import { motion } from 'framer-motion'
import { type DragEvent, type ReactNode, useId, useState } from 'react'

/**
 * Inspired by https://www.youtube.com/watch?v=O5lZqqy7VQE
 * https://www.hover.dev/components/boards
 * https://codesandbox.io/p/sandbox/fvy4m4
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
}: {
  data: T[]
  setData: SetData<T>
  showCardIndicator?: boolean
}) => {
  const instanceId = useId()

  return (
    <div className="flex h-full w-full overflow-scroll">
      {data.map((column) => (
        <Column
          key={column.columnId}
          column={column}
          data={data}
          setData={setData}
          boardId={instanceId}
          showCardIndicator={showCardIndicator}
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
}

const Column = <T extends ColumnType>({ column, data, setData, boardId, showCardIndicator }: ColumnProps<T>) => {
  const [active, setActive] = useState(false)

  /**
   * Column
   */
  const handleColumnDragStart = (e: DragEvent, columnId: string) => {
    e.dataTransfer?.setData('columnId', columnId)
  }

  const handleColumnDragEnd = (e: DragEvent) => {
    const columnId = e.dataTransfer?.getData('columnId')

    const indicators = getColumnIndicators()

    clearHighlights(indicators)

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
    e.dataTransfer?.setData('cardId', card.id)
    e.dataTransfer?.setData('columnId', columnId)
  }

  const handleCardDragEnd = (e: DragEvent, targetColumnId: string) => {
    e.stopPropagation()

    const cardId = e.dataTransfer?.getData('cardId')
    const columnId = e.dataTransfer?.getData('columnId')

    setActive(false)

    const indicators = getCardIndicators()

    clearHighlights(indicators)

    if (!cardId) {
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

    const cardId = e.dataTransfer?.getData('cardId')
    const columnId = e.dataTransfer?.getData('columnId')

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
        <div
          draggable
          className="flex h-11 cursor-grab items-center justify-between rounded-t border border-neutral-250 bg-neutral-100 px-3 py-2 active:cursor-grabbing"
          onDragStart={(e) => {
            // Force cast "e" to DragEvent due to wrong typing in framer-motion
            handleColumnDragStart(e as unknown as DragEvent, column.columnId)
          }}
        >
          {column.heading}
        </div>

        <div
          onDrop={(e) => handleCardDragEnd(e, column.columnId)}
          onDragOver={handleCardDragOver}
          onDragLeave={handleCardDragLeave}
          className={`w-full rounded-b border border-t-0 border-neutral-250 px-1 transition-colors ${active ? 'bg-green-100' : 'bg-neutral-200'}`}
        >
          {filteredCards.length > 0 ? (
            filteredCards.map((card) => {
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
          ) : (
            <div className="px-3 py-6 text-center">
              <i aria-hidden="true" className="fa-solid fa-wave-pulse text-neutral-350"></i>
              <p className="mt-1 text-xs font-medium text-neutral-350">
                No service for this stage. <br /> Please drag and drop a service.
              </p>
            </div>
          )}
          <CardDropIndicator columnId={column.columnId} boardId={boardId} />
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
