import { useParams } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Button, FunnelFlowBody, Heading, Icon, Section, Skeleton } from '@qovery/shared/ui'
import { useBlueprintUpdatePreviewSocket } from '../../hooks/use-blueprint-update-preview-socket/use-blueprint-update-preview-socket'
import { useBlueprintUpdateFlowContext } from './blueprint-update-context'
import { getRawOutputLineClassName } from './blueprint-update-utils'

export function BlueprintUpdatePreviewStep({ onBack }: { onBack: () => void }) {
  const { clusterId, handleUpdate, isUpdateLoading, previewId, requestPreview } = useBlueprintUpdateFlowContext()

  useEffect(() => {
    requestPreview()
  }, [requestPreview])

  return (
    <BlueprintUpdatePreview
      clusterId={clusterId}
      previewId={previewId}
      onBack={onBack}
      onConfirm={handleUpdate}
      loading={isUpdateLoading}
    />
  )
}

function BlueprintUpdatePreview({
  clusterId,
  loading,
  onBack,
  onConfirm,
  previewId,
}: {
  clusterId?: string
  loading: boolean
  onBack: () => void
  onConfirm: () => Promise<void>
  previewId?: string
}) {
  if (!clusterId || !previewId) {
    return (
      <BlueprintUpdatePreviewContent
        hasReceivedPreviewMessage={false}
        isPreviewOutputLoading
        loading={loading}
        onBack={onBack}
        onConfirm={onConfirm}
        rawOutput=""
      />
    )
  }

  return (
    <BlueprintUpdatePreviewWithSocket
      clusterId={clusterId}
      loading={loading}
      onBack={onBack}
      onConfirm={onConfirm}
      previewId={previewId}
    />
  )
}

function BlueprintUpdatePreviewWithSocket({
  clusterId,
  loading,
  onBack,
  onConfirm,
  previewId,
}: {
  clusterId: string
  loading: boolean
  onBack: () => void
  onConfirm: () => Promise<void>
  previewId: string
}) {
  const { organizationId = '' } = useParams({ strict: false })
  const {
    rawOutput,
    isLoading: isPreviewOutputLoading,
    hasReceivedMessage: hasReceivedPreviewMessage,
  } = useBlueprintUpdatePreviewSocket({ organizationId, clusterId, previewId })

  return (
    <BlueprintUpdatePreviewContent
      hasReceivedPreviewMessage={hasReceivedPreviewMessage}
      isPreviewOutputLoading={isPreviewOutputLoading}
      loading={loading}
      onBack={onBack}
      onConfirm={onConfirm}
      rawOutput={rawOutput}
    />
  )
}

function BlueprintUpdatePreviewContent({
  hasReceivedPreviewMessage,
  isPreviewOutputLoading,
  loading,
  onBack,
  onConfirm,
  rawOutput,
}: {
  hasReceivedPreviewMessage: boolean
  isPreviewOutputLoading: boolean
  loading: boolean
  onBack: () => void
  onConfirm: () => Promise<void>
  rawOutput: string
}) {
  const rawOutputContainerHeightClassName = rawOutput
    ? 'h-[min(75vh,calc(100vh-260px))] min-h-[260px]'
    : 'min-h-[180px]'

  return (
    <FunnelFlowBody customContentWidth="max-w-[620px]">
      <Section className="gap-6 pb-20">
        <Heading level={1}>Preview changes</Heading>

        <Section className="gap-2">
          <Heading level={3}>Raw output</Heading>
          <div
            className={`${rawOutputContainerHeightClassName} overflow-auto rounded-lg border border-neutral bg-surface-neutral px-4 py-3 font-mono text-xs leading-5 text-neutral`}
          >
            {rawOutput ? <BlueprintUpdateRawOutput rawOutput={rawOutput} /> : <BlueprintUpdateRawOutputSkeleton />}
          </div>
        </Section>
      </Section>

      <footer className="fixed bottom-0 left-1/2 z-10 flex w-full max-w-[620px] -translate-x-1/2 gap-3 border-t border-neutral bg-background px-4 py-4">
        <Button type="button" size="lg" variant="outline" color="neutral" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          size="lg"
          className="flex-1 justify-center"
          disabled={!hasReceivedPreviewMessage || isPreviewOutputLoading || loading}
          loading={loading}
          onClick={onConfirm}
        >
          Confirm & deploy update
          <Icon iconName="arrow-right" />
        </Button>
      </footer>
    </FunnelFlowBody>
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
  const skeletonLineWidths = ['46%', '28%', '72%', '64%', '82%', '34%']

  return (
    <div aria-label="Waiting for preview output" className="flex flex-col gap-3">
      <div className="mb-1 flex items-center gap-2 font-sans text-sm text-neutral-subtle">
        <Skeleton width={8} height={8} rounded />
        <span>Generating preview output</span>
      </div>
      {skeletonLineWidths.map((width, index) => (
        <Skeleton key={`${width}-${index}`} width={width} height={16} />
      ))}
    </div>
  )
}
