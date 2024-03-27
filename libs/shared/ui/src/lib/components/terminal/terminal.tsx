import { type ITerminalAddon, type ITerminalOptions, Terminal } from '@xterm/xterm'
import '@xterm/xterm/css/xterm.css'
import { type ComponentPropsWithoutRef, useEffect, useRef, useState } from 'react'

export interface UseTerminalProps {
  addons?: ITerminalAddon[]
  options?: ITerminalOptions
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

function useXTerm({ options, addons, listeners }: UseTerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const [terminalInstance, setTerminalInstance] = useState<Terminal | null>(null)

  useEffect(() => {
    const instance = new Terminal({
      allowTransparency: true,
      fontFamily: 'operator mono,SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace',
      fontSize: 14,
      theme: {
        background: 'transparent',
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

export interface TerminalProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'onResize' | 'onScroll'>,
    UseTerminalProps {}

export function XTerm({ className = '', options, addons, listeners, ...props }: TerminalProps) {
  const { ref } = useXTerm({
    options,
    addons,
    listeners,
  })

  return <div className={className} ref={ref} {...props} />
}

export default XTerm
