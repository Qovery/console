import { type ITerminalAddon, type ITerminalOptions, Terminal as XTerminal } from '@xterm/xterm'
import '@xterm/xterm/css/xterm.css'
import { useEffect, useRef } from 'react'

export interface TerminalProps {
  className?: string
  options?: ITerminalOptions
  addons?: ITerminalAddon[]
  onBinary?(data: string): void
  onCursorMove?(): void
  onData?(data: string): void
  onKey?(event: { key: string; domEvent: KeyboardEvent }): void
  onLineFeed?(): void
  onScroll?(newPosition: number): void
  onSelectionChange?(): void
  onRender?(event: { start: number; end: number }): void
  onResize?(event: { cols: number; rows: number }): void
  onTitleChange?(newTitle: string): void
  customKeyEventHandler?(event: KeyboardEvent): boolean
}

export function Terminal({
  className = '',
  options,
  addons,
  onBinary,
  onCursorMove,
  onData,
  onKey,
  onLineFeed,
  onScroll,
  onSelectionChange,
  onRender,
  onResize,
  onTitleChange,
  customKeyEventHandler,
}: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const terminal = useRef<XTerminal | null>(null)

  useEffect(() => {
    // Setup the XTerm terminal.
    terminal.current = new XTerminal(options)

    // Load addons if the prop exists
    if (addons) {
      addons.forEach((addon) => {
        terminal.current!.loadAddon(addon)
      })
    }

    // Listeners
    if (terminalRef.current) {
      if (onBinary) terminal.current.onBinary(onBinary)
      if (onCursorMove) terminal.current.onCursorMove(onCursorMove)
      if (onData) terminal.current.onData(onData)
      if (onKey) terminal.current.onKey(onKey)
      if (onLineFeed) terminal.current.onLineFeed(onLineFeed)
      if (onScroll) terminal.current.onScroll(onScroll)
      if (onSelectionChange) terminal.current.onSelectionChange(onSelectionChange)
      if (onRender) terminal.current.onRender(onRender)
      if (onResize) terminal.current.onResize(onResize)
      if (onTitleChange) terminal.current.onTitleChange(onTitleChange)

      // Add Custom Key Event Handler
      if (customKeyEventHandler) {
        terminal.current.attachCustomKeyEventHandler(customKeyEventHandler)
      }

      // Mount terminal
      terminal.current.open(terminalRef.current)
    }

    return () => {
      // When the component unmounts dispose of the terminal and all of its listeners
      terminal.current!.dispose()
    }
  }, [])

  return <div className={className} ref={terminalRef} />
}

export default Terminal
