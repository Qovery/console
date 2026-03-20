import { useEffect } from 'react'

export interface UseStreamingAnimationProps {
  streamingMessage: string
  displayedStreamingMessage: string
  setDisplayedStreamingMessage: (message: string | ((prev: string) => string)) => void
}

export function useStreamingAnimation({
  streamingMessage,
  displayedStreamingMessage,
  setDisplayedStreamingMessage,
}: UseStreamingAnimationProps) {
  useEffect(() => {
    if (streamingMessage.length === 0 || streamingMessage.length <= displayedStreamingMessage.length) {
      return
    }

    let animationFrameId: number
    let lastTimestamp = performance.now()
    let isPaused = false

    const animate = (timestamp: number) => {
      if (isPaused) {
        animationFrameId = requestAnimationFrame(animate)
        return
      }

      const elapsed = timestamp - lastTimestamp

      setDisplayedStreamingMessage((prev) => {
        const remaining = streamingMessage.length - prev.length

        if (remaining <= 0) {
          return streamingMessage
        }

        let chunkSize = 1
        const currentLength = prev.length

        let baseChunkSize = 2
        if (currentLength > 6000) {
          baseChunkSize = 5
        } else if (currentLength > 4000) {
          baseChunkSize = 4
        } else if (currentLength > 2000) {
          baseChunkSize = 3
        }

        if (elapsed > 100) {
          chunkSize = Math.min(100, remaining)
        } else if (elapsed > 16) {
          chunkSize = Math.min(baseChunkSize * 2, remaining)
        } else {
          chunkSize = Math.min(baseChunkSize, remaining)
        }

        const nextContent = streamingMessage.slice(0, prev.length + chunkSize)

        if (!streamingMessage.startsWith(nextContent)) {
          return streamingMessage
        }

        return nextContent
      })

      lastTimestamp = timestamp

      if (displayedStreamingMessage.length < streamingMessage.length) {
        animationFrameId = requestAnimationFrame(animate)
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isPaused = true
      } else {
        isPaused = false
        setDisplayedStreamingMessage(streamingMessage)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    animationFrameId = requestAnimationFrame(animate)

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [streamingMessage, displayedStreamingMessage, setDisplayedStreamingMessage])
}
