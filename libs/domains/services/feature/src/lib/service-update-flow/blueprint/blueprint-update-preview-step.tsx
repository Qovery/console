import { useEffect, useState } from 'react'
import { Button, FunnelFlowBody, Heading, Icon, Section, Skeleton } from '@qovery/shared/ui'
import { useBlueprintUpdatePreviewSocket } from '../../hooks/use-blueprint-update-preview-socket/use-blueprint-update-preview-socket'
import { useBlueprintUpdateFlowContext } from './blueprint-update-context'
import { BlueprintUpdateLoadingModal } from './blueprint-update-loading-modal'
import { getRawOutputLineClassName } from './blueprint-update-utils'

export function BlueprintUpdatePreviewStep({ onBack }: { onBack: () => void }) {
  const { clusterId, handleUpdate, isUpdateLoading, organizationId, previewId, requestPreview, service } =
    useBlueprintUpdateFlowContext()

  useEffect(() => {
    requestPreview()
  }, [requestPreview])

  return (
    <BlueprintUpdatePreview
      clusterId={clusterId}
      previewId={previewId}
      organizationId={organizationId}
      onBack={onBack}
      onConfirm={handleUpdate}
      loading={isUpdateLoading}
      serviceName={service.name}
    />
  )
}

function BlueprintUpdatePreview({
  clusterId,
  loading,
  onBack,
  onConfirm,
  organizationId,
  previewId,
  serviceName,
}: {
  clusterId?: string
  loading: boolean
  onBack: () => void
  onConfirm: () => Promise<void>
  organizationId: string
  previewId?: string
  serviceName: string
}) {
  const [submissionState, setSubmissionState] = useState<'loading' | 'error'>()
  const [errorMessage, setErrorMessage] = useState<string>()
  const {
    rawOutput,
    isLoading: isPreviewOutputLoading,
    hasReceivedMessage: hasReceivedPreviewMessage,
  } = useBlueprintUpdatePreviewSocket({ organizationId, clusterId, previewId })
  const rawOutputContainerHeightClassName = rawOutput
    ? 'h-[min(75vh,calc(100vh-260px))] min-h-[260px]'
    : 'min-h-[180px]'

  const handleConfirm = async () => {
    setErrorMessage(undefined)
    setSubmissionState('loading')

    try {
      await onConfirm()
    } catch (error) {
      setErrorMessage(error instanceof Error && error.message ? error.message : undefined)
      setSubmissionState('error')
    }
  }

  const handleEditConfig = () => {
    setSubmissionState(undefined)
    setErrorMessage(undefined)
    onBack()
  }

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
          disabled={!hasReceivedPreviewMessage || isPreviewOutputLoading || loading || submissionState !== undefined}
          loading={loading}
          onClick={handleConfirm}
        >
          Confirm & deploy update
          <Icon iconName="arrow-right" />
        </Button>
      </footer>

      <BlueprintUpdateLoadingModal
        errorMessage={errorMessage}
        onEditConfig={handleEditConfig}
        onRetry={handleConfirm}
        open={submissionState !== undefined}
        serviceName={serviceName}
        state={submissionState ?? 'loading'}
      />
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
