import { type CSSProperties, type RefObject, useEffect, useState } from 'react'

export interface UsePanelResizeProps {
  panelRef: RefObject<HTMLDivElement>
  expand: boolean
  storageKey: string
  style?: CSSProperties
}

export interface UsePanelResizeReturn {
  isResizing: boolean
  startResize: (e: React.MouseEvent) => void
}

export function usePanelResize({ panelRef, expand, storageKey, style }: UsePanelResizeProps): UsePanelResizeReturn {
  const [isResizing, setIsResizing] = useState(false)

  useEffect(() => {
    const applyPanelSize = () => {
      const panel = panelRef.current
      if (!panel) return

      if (expand) {
        panel.style.width = 'calc(100vw - 32px)'
        panel.style.height = 'calc(100vh - 32px)'
        panel.style.top = '1rem'
        panel.style.left = '1rem'
        panel.style.bottom = ''
        panel.style.right = ''
      } else {
        const size = localStorage.getItem(storageKey)
        if (size) {
          try {
            const { width, height } = JSON.parse(size)
            panel.style.width = `${Math.min(width, window.innerWidth * 0.9)}px`
            panel.style.height = `${Math.min(height, window.innerHeight * 0.9)}px`
          } catch (e) {
            console.error('Failed to apply panel size from localStorage', e)
            panel.style.width = `${Math.min(480, window.innerWidth * 0.9)}px`
            panel.style.height = `${Math.min(600, window.innerHeight * 0.9)}px`
          }
        } else {
          panel.style.width = `${Math.min(480, window.innerWidth * 0.9)}px`
          panel.style.height = `${Math.min(600, window.innerHeight * 0.9)}px`
        }
        panel.style.top = ''
        panel.style.left = ''
        panel.style.bottom = '8px'
        panel.style.right = '8px'
      }
    }

    applyPanelSize()
    window.addEventListener('resize', applyPanelSize)
    return () => window.removeEventListener('resize', applyPanelSize)
  }, [expand, style, panelRef, storageKey])

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault()
    const panel = panelRef.current
    if (!panel) return

    setIsResizing(true)

    const startX = e.clientX
    const startY = e.clientY
    const startWidth = panel.offsetWidth
    const startHeight = panel.offsetHeight
    const startLeft = panel.getBoundingClientRect().left
    const startTop = panel.getBoundingClientRect().top

    const onMouseMove = (e: MouseEvent) => {
      const dx = startX - e.clientX
      const dy = startY - e.clientY
      const maxWidth = window.innerWidth * 0.9
      const maxHeight = window.innerHeight * 0.9
      const newWidth = Math.min(Math.max(startWidth + dx, 450), maxWidth)
      const newHeight = Math.min(Math.max(startHeight + dy, 600), maxHeight)
      panel.style.width = `${newWidth}px`
      panel.style.height = `${newHeight}px`
      panel.style.left = `${startLeft - (newWidth - startWidth)}px`
      panel.style.top = `${startTop - (newHeight - startHeight)}px`
    }

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      localStorage.setItem(storageKey, JSON.stringify({ width: panel.offsetWidth, height: panel.offsetHeight }))
      setIsResizing(false)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  return {
    isResizing,
    startResize,
  }
}
