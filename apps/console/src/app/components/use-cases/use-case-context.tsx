import {
  type ReactNode,
  type SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

export type UseCaseOption = {
  id: string
  label: string
}

type UseCaseContextValue = {
  activePageId: string | null
  optionsByPageId: Record<string, UseCaseOption[]>
  selectionsByPageId: Record<string, string>
  registerUseCases: (pageId: string, options: UseCaseOption[]) => void
  setActivePageId: (pageId: SetStateAction<string | null>) => void
  setSelection: (pageId: string, selectionId: string) => void
}

type UseCaseProviderProps = {
  children: ReactNode
}

type UseCasePageConfig = {
  pageId: string
  options: UseCaseOption[]
  defaultCaseId?: string
}

const STORAGE_KEY = 'qovery:use-cases'

const UseCaseContext = createContext<UseCaseContextValue | undefined>(undefined)

const areOptionsEqual = (next: UseCaseOption[], prev: UseCaseOption[]) =>
  next.length === prev.length &&
  next.every((option, index) => option.id === prev[index]?.id && option.label === prev[index]?.label)

const readSelections = () => {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, string>) : {}
  } catch {
    return {}
  }
}

export function UseCaseProvider({ children }: UseCaseProviderProps) {
  const [activePageId, setActivePageId] = useState<string | null>(null)
  const [optionsByPageId, setOptionsByPageId] = useState<Record<string, UseCaseOption[]>>({})
  const [selectionsByPageId, setSelectionsByPageId] = useState<Record<string, string>>(readSelections)

  const registerUseCases = useCallback((pageId: string, options: UseCaseOption[]) => {
    setOptionsByPageId((prev) => {
      const existing = prev[pageId]
      if (existing && areOptionsEqual(options, existing)) {
        return prev
      }

      return {
        ...prev,
        [pageId]: options,
      }
    })
  }, [])

  const setSelection = useCallback((pageId: string, selectionId: string) => {
    setSelectionsByPageId((prev) => ({
      ...prev,
      [pageId]: selectionId,
    }))
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectionsByPageId))
    } catch {
      // Ignore localStorage failures (private mode, quota, etc.)
    }
  }, [selectionsByPageId])

  const value = useMemo<UseCaseContextValue>(
    () => ({
      activePageId,
      optionsByPageId,
      selectionsByPageId,
      registerUseCases,
      setActivePageId,
      setSelection,
    }),
    [activePageId, optionsByPageId, registerUseCases, selectionsByPageId, setSelection]
  )

  return <UseCaseContext.Provider value={value}>{children}</UseCaseContext.Provider>
}

export function useUseCases() {
  const context = useContext(UseCaseContext)

  if (!context) {
    throw new Error('useUseCases must be used within a UseCaseProvider')
  }

  return context
}

export function useUseCasePage({ pageId, options, defaultCaseId }: UseCasePageConfig) {
  const { registerUseCases, setActivePageId, selectionsByPageId, setSelection } = useUseCases()

  useEffect(() => {
    registerUseCases(pageId, options)
    setActivePageId(pageId)

    return () => {
      setActivePageId((current) => (current === pageId ? null : current))
    }
  }, [options, pageId, registerUseCases, setActivePageId])

  const selectedCaseId = useMemo(() => {
    const selected = selectionsByPageId[pageId]
    if (selected && options.some((option) => option.id === selected)) {
      return selected
    }

    if (defaultCaseId && options.some((option) => option.id === defaultCaseId)) {
      return defaultCaseId
    }

    return options[0]?.id ?? ''
  }, [defaultCaseId, options, pageId, selectionsByPageId])

  useEffect(() => {
    if (!selectedCaseId) {
      return
    }

    if (selectionsByPageId[pageId] !== selectedCaseId) {
      setSelection(pageId, selectedCaseId)
    }
  }, [pageId, selectedCaseId, selectionsByPageId, setSelection])

  return {
    selectedCaseId,
    setSelectedCaseId: (nextId: string) => setSelection(pageId, nextId),
  }
}
