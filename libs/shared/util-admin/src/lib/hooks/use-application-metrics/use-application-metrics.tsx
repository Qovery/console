import { useEffect, useRef, useState } from 'react'

interface Metrics {
  jank: number // Frame drops percentage
  delay: number // Network + processing delays in ms
  net: number // Active network requests
  mem: number // Memory usage in GB
}

interface History {
  jank: number[]
  delay: number[]
  net: number[]
  mem: number[]
}

interface NetworkRequest {
  type: 'fetch' | 'xhr'
  start: number
}

interface PerformanceObservers {
  longTaskObserver?: PerformanceObserver
}

interface UseApplicationMetricsReturn {
  metrics: Metrics
  history: History
}

// Extend Navigator interface for connection property
interface NavigatorWithConnection extends Navigator {
  connection?: {
    rtt?: number
  }
}

export function useApplicationMetrics(): UseApplicationMetricsReturn {
  const [metrics, setMetrics] = useState<Metrics>({
    jank: 0,
    delay: 0,
    net: 0,
    mem: 0,
  })

  const [history, setHistory] = useState<History>({
    jank: [],
    delay: [],
    net: [],
    mem: [],
  })

  const networkRequestsRef = useRef<Map<number, NetworkRequest>>(new Map())
  const observersRef = useRef<PerformanceObservers>({})

  useEffect(() => {
    // 1. JANK - Measure frame drops
    let lastFrameTime = performance.now()
    let frameCount = 0
    let droppedFrames = 0

    const measureFrameDrops = (currentTime: number) => {
      const deltaTime = currentTime - lastFrameTime
      frameCount++

      // If more than 16.67ms (60 FPS), we have a frame drop
      if (deltaTime > 16.67) {
        droppedFrames += Math.floor(deltaTime / 16.67) - 1
      }

      // Calculate percentage every 60 frames
      if (frameCount >= 60) {
        // Ensure jank stays within 0-100% range
        const jankPercentage = Math.min((droppedFrames / frameCount) * 100, 100)
        setMetrics((prev) => ({ ...prev, jank: Math.round(jankPercentage) }))
        setHistory((prev) => ({
          ...prev,
          jank: [...prev.jank.slice(-29), Math.round(jankPercentage)],
        }))
        frameCount = 0
        droppedFrames = 0
      }

      lastFrameTime = currentTime
      requestAnimationFrame(measureFrameDrops)
    }
    requestAnimationFrame(measureFrameDrops)

    // 2. DELAY - Measure network and processing delays
    const measureDelay = () => {
      const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      const recentEntries = entries.slice(-10) // Last 10 requests

      if (recentEntries.length > 0) {
        const totalDelay = recentEntries.reduce((acc, entry) => {
          // Total time = DNS + TCP + Request + Response + Processing
          const networkDelay = entry.responseEnd - entry.startTime
          return acc + networkDelay
        }, 0)

        const avgDelay = Math.round(totalDelay / recentEntries.length)
        setMetrics((prev) => ({ ...prev, delay: avgDelay }))
        setHistory((prev) => ({
          ...prev,
          delay: [...prev.delay.slice(-29), avgDelay],
        }))
      }

      // Also measure latency via Navigation Timing API
      if ((navigator as NavigatorWithConnection).connection?.rtt) {
        setMetrics((prev) => ({
          ...prev,
          delay: Math.round((prev.delay + (navigator as NavigatorWithConnection).connection!.rtt!) / 2),
        }))
      }
    }

    // 3. NET - Count active network requests
    const originalFetch = window.fetch
    const originalXHROpen = XMLHttpRequest.prototype.open
    const originalXHRSend = XMLHttpRequest.prototype.send

    // Intercept fetch
    window.fetch = function (...args: Parameters<typeof originalFetch>) {
      const requestId = Date.now() + Math.random()
      networkRequestsRef.current.set(requestId, { type: 'fetch', start: Date.now() })

      setMetrics((prev) => ({ ...prev, net: networkRequestsRef.current.size }))

      return originalFetch.apply(this, args).finally(() => {
        networkRequestsRef.current.delete(requestId)
        setMetrics((prev) => ({ ...prev, net: networkRequestsRef.current.size }))
        setHistory((prev) => ({
          ...prev,
          net: [...prev.net.slice(-29), networkRequestsRef.current.size],
        }))
      })
    }

    // Intercept XMLHttpRequest
    XMLHttpRequest.prototype.open = function (
      method: string,
      url: string | URL,
      async = true,
      username?: string | null,
      password?: string | null
    ) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(this as any)._requestId = Date.now() + Math.random()
      return originalXHROpen.call(this, method, url, true, username, password)
    }

    XMLHttpRequest.prototype.send = function (body?: Document | XMLHttpRequestBodyInit | null) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const requestId = (this as any)._requestId
      networkRequestsRef.current.set(requestId, { type: 'xhr', start: Date.now() })

      setMetrics((prev) => ({ ...prev, net: networkRequestsRef.current.size }))

      this.addEventListener('loadend', () => {
        networkRequestsRef.current.delete(requestId)
        setMetrics((prev) => ({ ...prev, net: networkRequestsRef.current.size }))
        setHistory((prev) => ({
          ...prev,
          net: [...prev.net.slice(-29), networkRequestsRef.current.size],
        }))
      })

      return originalXHRSend.call(this, body)
    }

    // 5. MEM - Memory usage
    const measureMemory = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((performance as any).memory) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const memoryUsageGB = (performance as any).memory.usedJSHeapSize / (1024 * 1024 * 1024)
        const roundedMemoryUsageGB = Number(memoryUsageGB.toFixed(2))

        setMetrics((prev) => ({ ...prev, mem: roundedMemoryUsageGB }))
        setHistory((prev) => ({
          ...prev,
          mem: [...prev.mem.slice(-29), roundedMemoryUsageGB],
        }))
      }
    }

    // Performance metrics observer
    if ('PerformanceObserver' in window) {
      try {
        // Observer for long tasks (causing jank)
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              // Long task detected, increase jank counter but limit the impact
              const additionalDroppedFrames = Math.min(Math.floor(entry.duration / 16.67), 10)
              droppedFrames += additionalDroppedFrames
            }
          }
        })

        // Some browsers don't support 'longtask'
        try {
          longTaskObserver.observe({ entryTypes: ['longtask'] })
          observersRef.current.longTaskObserver = longTaskObserver
        } catch (e) {
          console.log('Long task observer not supported')
        }
      } catch (e) {
        console.log('Performance Observer not fully supported')
      }
    }

    // Periodic metrics update
    const updateInterval = setInterval(() => {
      measureDelay()
      measureMemory()
    }, 2000)

    // Cleanup
    return () => {
      clearInterval(updateInterval)
      window.fetch = originalFetch
      XMLHttpRequest.prototype.open = originalXHROpen
      XMLHttpRequest.prototype.send = originalXHRSend

      Object.values(observersRef.current).forEach((observer) => {
        if (observer && observer.disconnect) {
          observer.disconnect()
        }
      })
    }
  }, [])

  return { metrics, history }
}
