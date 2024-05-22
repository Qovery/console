import { type ITerminalAddon, type ITerminalInitOnlyOptions, type ITerminalOptions, Terminal } from '@xterm/xterm'
import '@xterm/xterm/css/xterm.css'
import { type ComponentPropsWithoutRef, memo, useEffect, useRef, useState } from 'react'

export interface UseXTermProps {
  addons?: ITerminalAddon[]
  options?: ITerminalOptions & ITerminalInitOnlyOptions
  listeners?: {
    onBinary?(data: string): void
    onCursorMove?(): void
    onData?(data: string): void
    onKey?: (event: { key: string; domEvent: KeyboardEvent }) => void
    onLineFeed?(): void
    onScroll?(newPosition: number): void
    onSelectionChange?(): void
    onRender?(event: { start: number; end: number }): void
    onResize?(event: { cols: number; rows: number }): void
    onTitleChange?(newTitle: string): void
    customKeyEventHandler?(event: KeyboardEvent): boolean
  }
}

export function useXTerm({ options, addons, listeners }: UseXTermProps = {}) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const [terminalInstance, setTerminalInstance] = useState<Terminal | null>(null)

  useEffect(() => {
    const instance = new Terminal({
      fontFamily: 'Hack,operator mono,SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace',
      fontSize: 14,
      theme: {
        background: '#101420',
      },
      cursorStyle: 'underline',
      cursorBlink: false,
      ...options,
    })

    // Load addons if the prop exists
    if (addons) {
      addons.forEach((addon) => {
        instance.loadAddon(addon)
      })
    }

    // Listeners
    if (listeners) {
      if (listeners.onBinary) instance.onBinary(listeners.onBinary)
      if (listeners.onCursorMove) instance.onCursorMove(listeners.onCursorMove)
      if (listeners.onLineFeed) instance.onLineFeed(listeners.onLineFeed)
      if (listeners.onScroll) instance.onScroll(listeners.onScroll)
      if (listeners.onSelectionChange) instance.onSelectionChange(listeners.onSelectionChange)
      if (listeners.onRender) instance.onRender(listeners.onRender)
      if (listeners.onResize) instance.onResize(listeners.onResize)
      if (listeners.onTitleChange) instance.onTitleChange(listeners.onTitleChange)
      if (listeners.onKey) instance.onKey(listeners.onKey)
      if (listeners.onData) instance.onData(listeners.onData)

      // Add Custom Key Event Handler
      if (listeners.customKeyEventHandler) {
        instance.attachCustomKeyEventHandler(listeners.customKeyEventHandler)
      }
    }

    if (terminalRef.current) {
      // Mount terminal
      instance.open(terminalRef.current)
      instance.focus()
    }

    setTerminalInstance(instance)

    return () => {
      instance.dispose()
      setTerminalInstance(null)
    }
  }, [
    terminalRef,
    options,
    addons,
    listeners,
    listeners?.onBinary,
    listeners?.onCursorMove,
    listeners?.onData,
    listeners?.onKey,
    listeners?.onLineFeed,
    listeners?.onScroll,
    listeners?.onSelectionChange,
    listeners?.onRender,
    listeners?.onResize,
    listeners?.onTitleChange,
    listeners?.customKeyEventHandler,
  ])

  return {
    ref: terminalRef,
    instance: terminalInstance,
  }
}

export interface XTermProps extends Omit<ComponentPropsWithoutRef<'div'>, 'onResize' | 'onScroll'>, UseXTermProps {}

export const XTerm = memo(function XTerm({ className = '', options, addons, listeners, ...props }: XTermProps) {
  const { ref } = useXTerm({
    options,
    addons,
    listeners,
  })

  return <div className={className} ref={ref} {...props} />
})

export default XTerm
