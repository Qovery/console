import { motion } from 'framer-motion'
import {
  type Dispatch,
  type DragEvent,
  type ReactNode,
  type SetStateAction,
  createContext,
  useContext,
  useId,
  useState,
} from 'react'

const BoardContext = createContext<null | string>(null)

const Board = ({ data, setData }: { data: ColumnType[]; setData: Dispatch<SetStateAction<ColumnType[]>> }) => {
  const instanceId = useId()

  return (
    <BoardContext.Provider value={instanceId}>
      <div className="flex h-full w-full gap-3 overflow-scroll p-12">
        {data.map((column) => (
          <Column key={column.columnId} column={column} data={data} setData={setData} />
        ))}
      </div>
    </BoardContext.Provider>
  )
}

interface CardType {
  content: ReactNode
  id: string
}

export interface ColumnType {
  columnId: string
  title: string
  items: CardType[]
}

interface ColumnProps {
  column: ColumnType
  data: ColumnType[]
  setData: Dispatch<SetStateAction<ColumnType[]>>
}

const Column = ({ column, data, setData }: ColumnProps) => {
  const [active, setActive] = useState(false)
  const boardId = useContext(BoardContext)

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

    const before = element.dataset.before || '-1'

    if (before !== columnId) {
      let copy = [...cards]

      let columnToTransfer = copy.find((c) => c.id === columnId)

      if (!columnToTransfer) return

      columnToTransfer = { ...columnToTransfer, column }

      copy = copy.filter((c) => c.id !== columnId)

      const moveToBack = before === '-1'

      if (moveToBack) {
        copy.push(columnToTransfer)
      } else {
        const insertAtIndex = copy.findIndex((el) => el.id === before)

        if (insertAtIndex === undefined) return

        copy.splice(insertAtIndex, 0, columnToTransfer)
      }

      setData(copy)
    }
  }

  const getColumnIndicators = (): HTMLElement[] => {
    return Array.from(document.querySelectorAll(`[data-board="${boardId}"]`))
  }

  const getNearestColumnIndicator = (e: DragEvent, indicators: HTMLElement[]) => {}

  /**
   * Card
   */
  const handleCardDragStart = (e: DragEvent, card: CardType, columnId: string) => {
    e.dataTransfer?.setData('cardId', card.id)
    e.dataTransfer?.setData('columnId', columnId)
  }

  const handleCardDragEnd = (e: DragEvent, targetColumnId: string) => {
    const cardId = e.dataTransfer?.getData('cardId')
    const columnId = e.dataTransfer?.getData('columnId')

    setActive(false)

    const indicators = getCardIndicators()

    clearHighlights(indicators)

    const { element } = getNearestCardIndicator(e, indicators)

    const before = element.dataset.before || '-1'

    if (columnId === targetColumnId && before === cardId) {
      // drag without move
      return
    }

    let { columns: copy, cardToTransfer } = structuredClone(data).reduce<{
      columns: ColumnType[]
      cardToTransfer: CardType | undefined
    }>(
      (acc, col) => {
        if (col.columnId !== columnId) {
          acc.columns.push(col)
          return acc
        }
        acc.cardToTransfer = col.items.find((c) => c.id === cardId)
        col.items = col.items.filter((c) => c.id !== cardId)
        acc.columns.push(col)
        return acc
      },
      { columns: [], cardToTransfer: undefined }
    )

    if (!cardToTransfer) {
      throw Error('Unknown cardId')
    }

    setData(
      copy.map((col) => {
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
    )
  }

  const handleCardDragOver = (e: DragEvent) => {
    e.preventDefault()

    highlightCardIndicator(e)

    setActive(true)
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

    const el = getNearestCardIndicator(e, indicators)

    el.element.style.opacity = '1'
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
    <div className="flex w-60 shrink-0 flex-col rounded">
      <motion.div
        layout
        layoutId={column.columnId}
        draggable
        className="flex h-11 cursor-grab items-center justify-between rounded-t border border-neutral-250 bg-neutral-100 px-3 py-2 active:cursor-grabbing"
      >
        <h3 className="block truncate text-2xs font-bold text-neutral-400">{column.title}</h3>

        <span className="rounded text-sm text-neutral-400">{filteredCards.length}</span>
      </motion.div>

      <div
        onDrop={(e) => handleCardDragEnd(e, column.columnId)}
        onDragOver={handleCardDragOver}
        onDragLeave={handleCardDragLeave}
        className={`h-full w-full rounded-b border border-t-0 border-neutral-250 p-1 transition-colors ${active ? 'bg-green-100' : 'bg-neutral-200'}`}
      >
        {filteredCards.length > 0 ? (
          filteredCards.map((card) => {
            return <Card key={card.id} columnId={column.columnId} {...card} handleDragStart={handleCardDragStart} />
          })
        ) : (
          <div className="px-3 py-6 text-center">
            <i aria-hidden="true" className="fa-solid fa-wave-pulse text-neutral-350"></i>
            <p className="mt-1 text-xs font-medium text-neutral-350">
              No service for this stage. <br /> Please drag and drop a service.
            </p>
          </div>
        )}
        <CardDropIndicator columnId={column.columnId} />
      </div>
    </div>
  )
}

interface CardProps extends CardType {
  columnId: string
  handleDragStart: (e: DragEvent, card: CardType, columnId: string) => void
}

const Card = ({ columnId, handleDragStart, ...card }: CardProps) => {
  const { id, content } = card
  return (
    <>
      <CardDropIndicator beforeId={id} columnId={columnId} />

      <motion.div
        layout
        layoutId={id}
        draggable
        onDragStart={(e) => handleDragStart(e as unknown as DragEvent, card, columnId)}
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
}

const CardDropIndicator = ({ beforeId, columnId }: CardDropIndicatorProps) => {
  const boardId = useContext(BoardContext)
  return (
    <div
      data-before={beforeId ?? '-1'}
      data-board={boardId}
      data-column={columnId}
      className="my-0.5 h-0.5 w-full bg-violet-400 opacity-0"
    />
  )
}

export { Board }
export default Board
