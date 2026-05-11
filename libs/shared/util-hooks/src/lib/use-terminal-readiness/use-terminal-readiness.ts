import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const DEFAULT_OUTPUT_BUFFER_SIZE = 100
const ANSI_ESCAPE_SEQUENCE_REGEX = new RegExp(String.raw`\u001b\[[0-?]*[ -/]*[@-~]`, 'g')
const ANSI_OSC_SEQUENCE_REGEX = new RegExp(String.raw`\u001b\][^\u0007]*(\u0007|\u001b\\)`, 'g')

type TerminalMessageData = Blob | ArrayBuffer | string

export interface UseTerminalReadinessOptions {
  readyPrompt?: string | string[]
  outputBufferSize?: number
}

function sanitizeTerminalOutput(output: string) {
  return output.replace(ANSI_ESCAPE_SEQUENCE_REGEX, '').replace(ANSI_OSC_SEQUENCE_REGEX, '').replace(/\r/g, '')
}

function decodeTerminalBuffer(buffer: ArrayBuffer, decoderRef: { current: TextDecoder | null }) {
  if (typeof TextDecoder === 'function') {
    decoderRef.current ??= new TextDecoder()
    return decoderRef.current.decode(new Uint8Array(buffer))
  }

  // Jest's jsdom environment does not always expose TextDecoder, so keep a simple byte fallback.
  let decodedOutput = ''
  for (const value of new Uint8Array(buffer)) {
    decodedOutput += String.fromCharCode(value)
  }

  return decodedOutput
}

export function useTerminalReadiness({
  readyPrompt,
  outputBufferSize = DEFAULT_OUTPUT_BUFFER_SIZE,
}: UseTerminalReadinessOptions = {}) {
  const readyPromptKey = readyPrompt
    ? JSON.stringify(Array.isArray(readyPrompt) ? readyPrompt : [readyPrompt])
    : undefined
  const readyPrompts = useMemo<string[]>(() => {
    // Terminal components often pass prompt arrays inline. We memoize from a serialized
    // signature so equivalent prompt lists do not recreate websocket callbacks and trigger reconnect loops.
    return readyPromptKey ? (JSON.parse(readyPromptKey) as string[]) : []
  }, [readyPromptKey])
  const decoderRef = useRef<TextDecoder | null>(null)
  const messageListenerCleanupRef = useRef<(() => void) | null>(null)
  const terminalOutputBufferRef = useRef('')
  const [isTerminalReady, setIsTerminalReady] = useState(false)

  const resetTerminalReadiness = useCallback(() => {
    terminalOutputBufferRef.current = ''
    setIsTerminalReady(false)
  }, [])

  const updateTerminalReadiness = useCallback(
    (terminalChunk: string) => {
      const sanitizedTerminalChunk = sanitizeTerminalOutput(terminalChunk)

      // Shell prompts can arrive as binary frames and be split across multiple websocket messages.
      // We keep a rolling sanitized buffer so readiness tracks the prompt users actually see.
      terminalOutputBufferRef.current = (terminalOutputBufferRef.current + sanitizedTerminalChunk).slice(
        -outputBufferSize
      )

      // Some shells print a banner before the prompt, and prompts vary a lot across images.
      // When no explicit prompt is configured, the first visible shell output is enough to hide the loader.
      if (
        (readyPrompts.length > 0 && readyPrompts.some((prompt) => terminalOutputBufferRef.current.includes(prompt))) ||
        (readyPrompts.length === 0 && sanitizedTerminalChunk.trim().length > 0)
      ) {
        setIsTerminalReady(true)
      }
    },
    [outputBufferSize, readyPrompts]
  )

  const decodeTerminalMessage = useCallback(
    async (data: TerminalMessageData) => {
      if (typeof data === 'string') {
        updateTerminalReadiness(data)
        return
      }

      if (data instanceof Blob) {
        const buffer = await data.arrayBuffer()
        updateTerminalReadiness(decodeTerminalBuffer(buffer, decoderRef))
        return
      }

      updateTerminalReadiness(decodeTerminalBuffer(data, decoderRef))
    },
    [updateTerminalReadiness]
  )

  const detachWebSocket = useCallback(() => {
    messageListenerCleanupRef.current?.()
    messageListenerCleanupRef.current = null
  }, [])

  const attachWebSocket = useCallback(
    (websocket: WebSocket) => {
      const onMessage = (messageEvent: MessageEvent<TerminalMessageData>) => {
        void decodeTerminalMessage(messageEvent.data)
      }

      detachWebSocket()
      resetTerminalReadiness()
      websocket.addEventListener('message', onMessage)
      messageListenerCleanupRef.current = () => websocket.removeEventListener('message', onMessage)
    },
    [decodeTerminalMessage, detachWebSocket, resetTerminalReadiness]
  )

  useEffect(() => {
    return () => {
      detachWebSocket()
    }
  }, [detachWebSocket])

  return {
    attachWebSocket,
    detachWebSocket,
    isTerminalReady,
    resetTerminalReadiness,
  }
}

export default useTerminalReadiness
