import { type CSSProperties, useEffect, useState } from 'react'
import { Icon } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'

// DEBUG: while true, the loading screen never auto-advances to the preview step.
// Steps loop indefinitely and clicking the card transitions to the preview. Remove
// once the loading UI is finalized.
const DEBUG_KEEP_LOADING = true

type StepStatus = 'done' | 'active' | 'pending'

const LOADING_STEPS = [
  { id: 'plan', label: 'Running infrastructure plan', durationMs: 2400 },
  { id: 'mapping', label: 'Mapping changes to your services', durationMs: 2800 },
  { id: 'analyzing', label: 'Analyzing impact', durationMs: 1800 },
] as const

// Shimmer effect for the active step: a horizontal gradient travels across the
// text from text-neutral-disabled (--neutral-10) through text-neutral (--neutral-12)
// and back, clipped to the text. Uses the same `shiny-text` keyframe as
// <AnimatedGradientText> in shared/ui — the keyframe expects a `--shiny-width`
// CSS variable to bound the sweep.
const ACTIVE_STEP_SHIMMER_WIDTH_PX = 80
const ACTIVE_STEP_CLASSNAME = twMerge(
  'inline-flex items-center bg-gradient-to-r',
  'from-[var(--neutral-10)] via-[var(--neutral-12)] to-[var(--neutral-10)]',
  'bg-clip-text text-transparent',
  '[background-position:0_0] [background-size:var(--shiny-width)_100%]',
  'animate-[shiny-text_3s_linear_infinite]'
)

export interface PreviewChangesLoadingCardProps {
  onComplete: () => void
}

export function PreviewChangesLoadingCard({ onComplete }: PreviewChangesLoadingCardProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [stepStartedAt, setStepStartedAt] = useState(() => Date.now())
  const [elapsedSeconds, setElapsedSeconds] = useState<number[]>(() => LOADING_STEPS.map(() => 0))

  useEffect(() => {
    if (activeIndex >= LOADING_STEPS.length) {
      if (DEBUG_KEEP_LOADING) {
        // Loop the steps so the loading state stays visible for inspection.
        const restartTimer = window.setTimeout(() => {
          setElapsedSeconds(LOADING_STEPS.map(() => 0))
          setActiveIndex(0)
          setStepStartedAt(Date.now())
        }, 1200)
        return () => window.clearTimeout(restartTimer)
      }
      onComplete()
      return
    }
    const advanceTimer = window.setTimeout(() => {
      setElapsedSeconds((prev) => {
        const next = [...prev]
        next[activeIndex] = Math.max(1, Math.round(LOADING_STEPS[activeIndex].durationMs / 1000))
        return next
      })
      setActiveIndex((i) => i + 1)
      setStepStartedAt(Date.now())
    }, LOADING_STEPS[activeIndex].durationMs)
    return () => window.clearTimeout(advanceTimer)
  }, [activeIndex, onComplete])

  useEffect(() => {
    if (activeIndex >= LOADING_STEPS.length) return
    const tick = window.setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = [...prev]
        next[activeIndex] = Math.max(1, Math.floor((Date.now() - stepStartedAt) / 1000))
        return next
      })
    }, 250)
    return () => window.clearInterval(tick)
  }, [activeIndex, stepStartedAt])

  return (
    <div
      role={DEBUG_KEEP_LOADING ? 'button' : undefined}
      tabIndex={DEBUG_KEEP_LOADING ? 0 : undefined}
      onClick={DEBUG_KEEP_LOADING ? onComplete : undefined}
      onKeyDown={
        DEBUG_KEEP_LOADING
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onComplete()
              }
            }
          : undefined
      }
      className={twMerge(
        'w-96 overflow-hidden rounded-xl border border-neutral bg-surface-neutral-subtle shadow-Cards',
        DEBUG_KEEP_LOADING && 'cursor-pointer'
      )}
    >
      {/* Header sits on the outer card's subtle surface. */}
      <div className="flex items-center gap-2 px-4 py-3">
        <Icon iconName="wrench" iconStyle="regular" className="text-sm text-neutral-subtle" />
        <h3 className="text-sm font-medium text-neutral">Building your infrastructure preview</h3>
      </div>

      {/* Nested card. Outline (not border) so the inner stroke doesn't compound with the outer
          card's border. */}
      <div className="rounded-xl bg-surface-neutral outline outline-1 outline-[var(--neutral-6)]">
        <ul className="flex flex-col gap-2 p-4">
        {LOADING_STEPS.map((step, index) => {
          const status: StepStatus =
            index < activeIndex ? 'done' : index === activeIndex ? 'active' : 'pending'
          const elapsed = elapsedSeconds[index]

          return (
            <li key={step.id} className="flex items-center justify-between gap-3">
              <span
                style={
                  status === 'active'
                    ? ({ '--shiny-width': `${ACTIVE_STEP_SHIMMER_WIDTH_PX}px` } as CSSProperties)
                    : undefined
                }
                className={twMerge(
                  'truncate text-sm',
                  status === 'pending'
                    ? 'text-neutral-disabled'
                    : status === 'active'
                      ? ACTIVE_STEP_CLASSNAME
                      : 'text-neutral'
                )}
              >
                {step.label}
              </span>
              {status !== 'pending' && elapsed > 0 ? (
                <span className="shrink-0 font-mono text-xs tabular-nums text-neutral-subtle">{elapsed}s</span>
              ) : null}
            </li>
          )
        })}
        </ul>
      </div>
    </div>
  )
}

export default PreviewChangesLoadingCard
