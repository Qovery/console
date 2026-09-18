import { useParams } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { match } from 'ts-pattern'
import { Button, FunnelFlowBody, Heading, Icon, Section, Skeleton } from '@qovery/shared/ui'
import { twMerge } from '@qovery/shared/util-js'
import {
  type BlueprintUpdatePreviewOutcome,
  useBlueprintUpdatePreviewSocket,
} from '../hooks/use-blueprint-update-preview-socket/use-blueprint-update-preview-socket'
import { useBlueprintUpdateFlowContext } from './blueprint-update-context'
import { getRawOutputLineClassName } from './blueprint-update-utils'

const PREVIEW_LOADING_MESSAGES = [
  'Generating preview output',
  'Analyzing the planned changes',
  'Still working on your preview',
  'Finalizing preview output',
]
const PREVIEW_LOADING_MESSAGE_INTERVAL = 8_000

export function BlueprintUpdatePreviewStep({ onBack }: { onBack: () => void }) {
  const { clusterId, handleUpdate, isUpdateLoading, previewError, previewId, requestPreview, retryPreview } =
    useBlueprintUpdateFlowContext()

  useEffect(() => {
    requestPreview()
  }, [requestPreview])

  return (
    <BlueprintPreview
      clusterId={clusterId}
      previewId={previewId}
      onBack={onBack}
      onConfirm={handleUpdate}
      onRetry={retryPreview}
      loading={isUpdateLoading}
      previewError={previewError}
    />
  )
}

export function BlueprintPreview({
  clusterId,
  loading,
  onBack,
  onConfirm,
  onRetry,
  previewError,
  previewId,
  layout = 'page',
}: {
  clusterId?: string
  loading: boolean
  onBack: () => void
  onConfirm: () => Promise<void>
  onRetry: () => Promise<void>
  previewError: boolean
  previewId?: string
  layout?: 'page' | 'modal'
}) {
  if (!clusterId || !previewId) {
    return (
      <BlueprintUpdatePreviewContent
        loading={loading}
        onBack={onBack}
        onConfirm={onConfirm}
        onRetry={onRetry}
        outcome={previewError ? { type: 'error' } : { type: 'pending' }}
        layout={layout}
      />
    )
  }

  return (
    <BlueprintUpdatePreviewWithSocket
      clusterId={clusterId}
      loading={loading}
      onBack={onBack}
      onConfirm={onConfirm}
      onRetry={onRetry}
      previewError={previewError}
      previewId={previewId}
      layout={layout}
    />
  )
}

function BlueprintUpdatePreviewWithSocket({
  clusterId,
  loading,
  onBack,
  onConfirm,
  onRetry,
  previewError,
  previewId,
  layout,
}: {
  clusterId: string
  loading: boolean
  onBack: () => void
  onConfirm: () => Promise<void>
  onRetry: () => Promise<void>
  previewError: boolean
  previewId: string
  layout: 'page' | 'modal'
}) {
  const { organizationId = '' } = useParams({ strict: false })
  const { outcome } = useBlueprintUpdatePreviewSocket({ organizationId, clusterId, previewId })

  return (
    <BlueprintUpdatePreviewContent
      loading={loading}
      onBack={onBack}
      onConfirm={onConfirm}
      onRetry={onRetry}
      outcome={previewError ? { type: 'error' } : outcome}
      layout={layout}
    />
  )
}

function BlueprintUpdatePreviewContent({
  loading,
  onBack,
  onConfirm,
  onRetry,
  outcome,
  layout = 'page',
}: {
  loading: boolean
  onBack: () => void
  onConfirm: () => Promise<void>
  onRetry: () => Promise<void>
  outcome: BlueprintUpdatePreviewOutcome
  layout?: 'page' | 'modal'
}) {
  const canConfirm = outcome.type === 'diff' || outcome.type === 'no-changes'
  const isModalPending = layout === 'modal' && outcome.type === 'pending'
  const rawOutputContainerHeightClassName =
    outcome.type === 'diff'
      ? layout === 'modal'
        ? 'min-h-[220px]'
        : 'h-[min(75vh,calc(100vh-320px))] min-h-[260px]'
      : isModalPending
        ? ''
        : 'min-h-[180px]'
  const body = (
    <Section className={twMerge(isModalPending ? 'flex min-h-full w-full flex-1 flex-col gap-4' : 'gap-4')}>
      <Heading level={1}>Preview changes</Heading>
      <Section className={twMerge(isModalPending ? 'flex min-h-0 flex-1 flex-col gap-2' : 'gap-2')}>
        <Heading level={3}>Raw output</Heading>
        <div
          data-testid="blueprint-preview-raw-output"
          className={twMerge(
            rawOutputContainerHeightClassName,
            isModalPending && 'min-h-0 flex-1',
            'flex flex-col rounded-lg border border-neutral bg-surface-neutral px-4 py-3 font-mono text-xs leading-5 text-neutral',
            layout === 'modal' ? 'overflow-visible' : 'overflow-auto'
          )}
        >
          {match(outcome)
            .with({ type: 'pending' }, () => <BlueprintUpdateRawOutputSkeleton />)
            .with({ type: 'diff' }, ({ rawOutput }) => <BlueprintUpdateRawOutput rawOutput={rawOutput} />)
            .with({ type: 'no-changes' }, () => (
              <div className="flex flex-1 items-center justify-center font-sans text-sm text-neutral-subtle">
                No infrastructure changes detected.
              </div>
            ))
            .with({ type: 'error' }, ({ message }) => (
              <BlueprintUpdatePreviewFailure
                onRetry={onRetry}
                reason={message}
                summary="Unable to generate the preview."
              />
            ))
            .with({ type: 'cancelled' }, () => (
              <BlueprintUpdatePreviewFailure onRetry={onRetry} summary="The preview was cancelled." />
            ))
            .with({ type: 'timeout' }, ({ message }) => (
              <BlueprintUpdatePreviewFailure
                onRetry={onRetry}
                reason={message}
                summary="The preview timed out before completing."
              />
            ))
            .exhaustive()}
        </div>
      </Section>
    </Section>
  )
  const footer = (
    <footer
      className={twMerge(
        layout === 'modal'
          ? 'absolute bottom-0 left-0 flex w-full gap-3 border-t border-neutral bg-background px-8 py-4'
          : 'fixed bottom-0 left-1/2 z-10 flex w-full max-w-[620px] -translate-x-1/2 gap-3 border-t border-neutral bg-background py-4'
      )}
    >
      <Button type="button" size="lg" variant="outline" color="neutral" onClick={onBack}>
        {layout === 'modal' ? 'Cancel' : 'Back'}
      </Button>
      <Button
        type="button"
        size="lg"
        className="flex-1 justify-center"
        disabled={!canConfirm || loading}
        loading={loading}
        onClick={onConfirm}
      >
        {layout === 'modal' ? 'Confirm & Deploy changes' : 'Confirm & deploy update'}
        <Icon iconName="arrow-right" />
      </Button>
    </footer>
  )

  if (layout === 'modal') {
    return (
      <div className="relative flex h-full min-h-0 flex-col">
        <div data-testid="blueprint-preview-modal-content" className="min-h-0 flex-1 overflow-y-auto pb-20">
          <div className={twMerge(isModalPending ? 'flex min-h-full w-full' : 'w-full', 'px-8 py-8')}>{body}</div>
        </div>
        {footer}
      </div>
    )
  }

  return (
    <FunnelFlowBody customContentWidth="max-w-[684px]">
      {body}
      {footer}
    </FunnelFlowBody>
  )
}

function BlueprintUpdatePreviewFailure({
  onRetry,
  reason,
  summary,
}: {
  onRetry: () => Promise<void>
  reason?: string
  summary: string
}) {
  return (
    <div
      role="alert"
      className="flex flex-1 flex-col items-center justify-center gap-3 font-sans text-sm text-neutral-subtle"
    >
      <span>{summary}</span>
      {reason ? <span className="max-w-full whitespace-pre-wrap text-center text-xs">{reason}</span> : null}
      <Button type="button" variant="outline" color="neutral" size="md" onClick={() => void onRetry()}>
        <Icon iconName="arrow-rotate-right" iconStyle="regular" />
        Retry preview
      </Button>
    </div>
  )
}

function BlueprintUpdateRawOutput({ rawOutput }: { rawOutput: string }) {
  const lines = rawOutput.split('\n')

  return (
    <pre className="whitespace-pre-wrap">
      {lines.map((line, index) => (
        <span key={`${index}-${line}`} className={getRawOutputLineClassName(line)}>
          {line}
          {index < lines.length - 1 ? '\n' : null}
        </span>
      ))}
    </pre>
  )
}

function BlueprintUpdateRawOutputSkeleton() {
  const skeletonLineWidths = ['46%', '28%', '72%', '64%', '82%', '34%', '58%', '76%', '41%', '88%', '67%', '52%']
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setMessageIndex((currentIndex) => (currentIndex + 1) % PREVIEW_LOADING_MESSAGES.length)
    }, PREVIEW_LOADING_MESSAGE_INTERVAL)

    return () => window.clearInterval(intervalId)
  }, [])

  return (
    <div aria-label="Waiting for preview output" className="flex min-h-0 flex-1 flex-col justify-between">
      <div className="mb-1 flex items-center gap-2 font-sans text-sm text-neutral-subtle">
        <Skeleton width={8} height={8} rounded />
        <span aria-live="polite">{PREVIEW_LOADING_MESSAGES[messageIndex]}</span>
      </div>
      {skeletonLineWidths.map((width, index) => (
        <Skeleton key={`${width}-${index}`} width={width} height={16} />
      ))}
    </div>
  )
}
