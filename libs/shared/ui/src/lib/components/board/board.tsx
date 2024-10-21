import { motion } from 'framer-motion'
import {
  type DragEvent,
  type PropsWithChildren,
  type ReactNode,
  createContext,
  useContext,
  useId,
  useState,
} from 'react'
import { twMerge } from '@qovery/shared/util-js'

/**
 * Inspired by https://www.youtube.com/watch?v=O5lZqqy7VQE
 * https://www.hover.dev/components/boards
 * https://codesandbox.io/p/sandbox/fvy4m4
 *
 * NOTE: This component doesn't fully follow the "compound pattern" as
 * - it requires complex typing
 * - it needs to pass props to child components like drag n drop handles
 * - it is rarely used so no big of a need to be highly configurable
 * However in the future it can be turn into a compound pattern using a react context
 */

interface BoardContextType {
  boardId: string
}

const BoardContext = createContext<BoardContextType | null>(null)

const useBoardContext = () => {
  const context = useContext(BoardContext)
  if (!context) {
    throw new Error('Board components must be used within a Board')
  }
  return context
}

const BoardRoot = ({ children, className }: PropsWithChildren & { className?: string }) => {
  const boardId = useId()

  return (
    <BoardContext.Provider value={{ boardId }}>
      <div className={twMerge('flex h-full w-full overflow-x-scroll pb-5', className)}>{children}</div>
    </BoardContext.Provider>
  )
}

interface Card {
  cardId: string
  columnId: string
}

type SetData<T extends Card> = ({
  sourceColumnId,
  sourceCardId,
  targetColumnId,
  newData,
}: {
  sourceColumnId: string
  sourceCardId?: string
  targetColumnId: string
  newData: T[]
}) => void

interface BoardColumnProps<T extends Card> extends PropsWithChildren {
  heading: ReactNode
  data: T[]
  columnId: string
  setData: SetData<T>
  shouldHighlightIndicator?: boolean
}

const BoardColumn = <T extends Card>({
  heading,
  data,
  columnId,
  setData,
  children,
  shouldHighlightIndicator = true,
}: BoardColumnProps<T>) => {
  const [active, setActive] = useState(false)
  const { boardId } = useBoardContext()

  const handleDragEnd = (e: DragEvent) => {
    const cardId = e.dataTransfer?.getData('cardId')
    const sourceColumnId = e.dataTransfer?.getData('columnId')

    setActive(false)

    clearHighlights()

    const indicators = getIndicators()

    const { element } = getNearestIndicator(e, indicators)

    const before = element.dataset['before'] || '-1'

    if (before !== cardId) {
      let copy = [...data]

      let cardToTransfer = copy.find((c) => c.cardId === cardId)

      if (!cardToTransfer) return

      cardToTransfer = { ...cardToTransfer, columnId }

      copy = copy.filter((c) => c.cardId !== cardId)

      const moveToBack = before === '-1'

      if (moveToBack) {
        copy.push(cardToTransfer)
      } else {
        const insertAtIndex = copy.findIndex((el) => el.cardId === before)

        if (insertAtIndex === undefined) return

        copy.splice(insertAtIndex, 0, cardToTransfer)
      }

      setData({
        sourceColumnId,
        sourceCardId: cardId,
        targetColumnId: columnId,
        newData: copy,
      })
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

    if (shouldHighlightIndicator) {
      const el = getNearestIndicator(e, indicators)

      el.element.style.opacity = '1'
    }
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
    return Array.from(document.querySelectorAll(`[data-board="${boardId}"][data-column="${columnId}"]`))
  }

  const handleDragLeave = () => {
    clearHighlights()

    setActive(false)
  }

  return (
    <motion.div layout="position" layoutId={columnId} className="flex w-60 shrink-0 flex-col rounded">
      <div className="flex h-[58px] items-center justify-between rounded-t border border-neutral-250 bg-neutral-100 px-3 py-2">
        {heading}
      </div>

      <div
        onDrop={(e) => handleDragEnd(e)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`w-full rounded-b border border-t-0 border-neutral-250 px-1 transition-colors ${active ? 'bg-green-100' : 'bg-neutral-200'}`}
      >
        {children}
        <BoardDropIndicator columnId={columnId} />
      </div>
    </motion.div>
  )
}

interface BoardCardProps extends Card, PropsWithChildren {}

const BoardCard = ({ children, cardId, columnId }: BoardCardProps) => {
  const handleDragStart = (e: DragEvent) => {
    e.dataTransfer?.setData('cardId', cardId)
    e.dataTransfer?.setData('columnId', columnId)
  }

  return (
    <>
      <BoardDropIndicator beforeId={cardId} columnId={columnId} />
      <motion.div
        layout
        layoutId={cardId}
        draggable="true"
        onDragStart={(e) => handleDragStart(e as unknown as DragEvent)}
        className="cursor-grab rounded border border-neutral-200 bg-neutral-50 px-2 py-3 active:cursor-grabbing active:outline active:outline-green-500"
      >
        {children}
      </motion.div>
    </>
  )
}

interface BoardDropIndicatorProps {
  beforeId?: string
  columnId: string
}

const BoardDropIndicator = ({ beforeId, columnId }: BoardDropIndicatorProps) => {
  const { boardId } = useBoardContext()

  return (
    <div
      data-before={beforeId ?? '-1'}
      data-board={boardId}
      data-column={columnId}
      className="my-0.5 h-0.5 w-full bg-violet-400 opacity-0"
    />
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
export type { Card as BoardCard }
