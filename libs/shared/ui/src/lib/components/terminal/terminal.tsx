import { type ITerminalAddon, type ITerminalOptions, Terminal as XTerminal } from '@xterm/xterm'
import '@xterm/xterm/css/xterm.css'
import { type ReactNode, createContext, useEffect, useMemo, useRef } from 'react'

// export const TerminalContext = createContext<any | undefined>({
//   options: {
//     allowTransparency: true,
//     fontFamily: 'operator mono,SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace',
//     fontSize: 14,
//     theme: {
//       background: 'transparent',
//     },
//     cursorStyle: 'underline',
//     cursorBlink: false,
//   },
// })

// export function TerminalProvider({ options = {}, children }: { options?: ITerminalOptions; children: ReactNode }) {
//   return (
//     <TerminalContext.Provider
//       value={{
//         options,
//       }}
//     >
//       {children}
//     </TerminalContext.Provider>
//   )
// }

export function useTerminal({ options }: { options?: ITerminalOptions } = {}) {
  const terminalRef = useRef<XTerminal | null>(null)

  if (!terminalRef.current) {
    terminalRef.current = new XTerminal({
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
  }

  return {
    instance: terminalRef.current,
  }
}

export interface TerminalProps {
  className?: string
  addons?: ITerminalAddon[]
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

export function Terminal({
  className = '',
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
  const { instance } = useTerminal()
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load addons if the prop exists
    if (addons) {
      addons.forEach((addon) => {
        instance.loadAddon(addon)
      })
    }

    // Listeners
    if (terminalRef.current) {
      if (onBinary) instance.onBinary(onBinary)
      if (onCursorMove) instance.onCursorMove(onCursorMove)
      if (onLineFeed) instance.onLineFeed(onLineFeed)
      if (onScroll) instance.onScroll(onScroll)
      if (onSelectionChange) instance.onSelectionChange(onSelectionChange)
      if (onRender) instance.onRender(onRender)
      if (onResize) instance.onResize(onResize)
      if (onTitleChange) instance.onTitleChange(onTitleChange)
      if (onKey) instance.onKey((event) => onKey(event))
      if (onData) instance.onData((data) => onData(data))

      // Add Custom Key Event Handler
      if (customKeyEventHandler) {
        instance.attachCustomKeyEventHandler(customKeyEventHandler)
      }

      // Mount terminal
      instance.open(terminalRef.current)
    }

    return () => {
      // When the component unmounts dispose of the terminal and all of its listeners
      instance.dispose()
    }
  }, [
    instance,
    addons,
    customKeyEventHandler,
    onBinary,
    onData,
    onKey,
    onCursorMove,
    onLineFeed,
    onRender,
    onResize,
    onScroll,
    onSelectionChange,
    onTitleChange,
    terminalRef,
  ])

  return <div className={className} ref={terminalRef} />
}

export default Terminal
