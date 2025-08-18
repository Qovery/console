import { useCallback } from 'react'

export interface UseChartHighlightingSyncProps {
  selectedKeys?: Set<string>
  onSelectionChange?: (keys: Set<string>) => void
  highlightedKey?: string | null
  onHighlightChange?: (key: string | null) => void
}

export interface UseChartHighlightingSyncResult {
  selectedKeys: Set<string>
  onSelectionToggle: (key: string) => void
  highlightedKey: string | null
  onHighlight: (key: string | null) => void
}

/**
 * Simple hook for chart highlighting synchronization.
 * Can be used with any context that provides chart highlighting state.
 */
export function useChartHighlightingSync({
  selectedKeys = new Set(),
  onSelectionChange,
  highlightedKey = null,
  onHighlightChange,
}: UseChartHighlightingSyncProps): UseChartHighlightingSyncResult {
  const onSelectionToggle = useCallback(
    (key: string) => {
      if (!onSelectionChange) return

      const next = new Set(selectedKeys)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      onSelectionChange(next)
    },
    [selectedKeys, onSelectionChange]
  )

  const onHighlight = useCallback(
    (key: string | null) => {
      onHighlightChange?.(key)
    },
    [onHighlightChange]
  )

  return {
    selectedKeys,
    onSelectionToggle,
    highlightedKey,
    onHighlight,
  }
}
