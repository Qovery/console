import { type IconName } from '@fortawesome/fontawesome-common-types'
import { type PropsWithChildren, useEffect, useState } from 'react'
import { match } from 'ts-pattern'
import { Badge, Button, Heading, Icon } from '@qovery/shared/ui'
import { useCopyToClipboard } from '@qovery/shared/util-hooks'
import { formatDeploymentLogDuration } from '../utils/deployment-log-steps'
import { type BuildOptimizationAnalysis, type BuildOptimizationConfidence } from './build-optimization-analysis'

function AnalysisLabel({ iconName, children }: PropsWithChildren<{ iconName: IconName }>) {
  return (
    <span className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-neutral-subtle">
      <Icon iconName={iconName} iconStyle="regular" className="w-3.5" />
      {children}
    </span>
  )
}

function AnalysisRow({ iconName, label, children }: PropsWithChildren<{ iconName: IconName; label: string }>) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-neutral p-4">
      <AnalysisLabel iconName={iconName}>{label}</AnalysisLabel>
      {children}
    </div>
  )
}

function ConfidenceBadge({ confidence }: { confidence: BuildOptimizationConfidence }) {
  const { color, label } = match(confidence)
    .with('HIGH', () => ({ color: 'green' as const, label: 'High' }))
    .with('MEDIUM', () => ({ color: 'yellow' as const, label: 'Medium' }))
    .with('LOW', () => ({ color: 'red' as const, label: 'Low' }))
    .exhaustive()

  return (
    <Badge size="sm" color={color} variant="surface" className="rounded-md font-medium">
      {label}
    </Badge>
  )
}

function CopyPromptButton({ prompt }: { prompt: string }) {
  const [, copyToClipboard] = useCopyToClipboard()
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    if (!isCopied) return
    const timeout = setTimeout(() => setIsCopied(false), 2000)
    return () => clearTimeout(timeout)
  }, [isCopied])

  return (
    <Button
      variant="outline"
      color="neutral"
      size="sm"
      onClick={() => {
        copyToClipboard(prompt)
        setIsCopied(true)
      }}
    >
      <Icon iconName={isCopied ? 'check' : 'copy'} iconStyle="regular" />
      {isCopied ? 'Copied' : 'Copy'}
    </Button>
  )
}

export interface BuildOptimizationModalProps {
  analysis: BuildOptimizationAnalysis
  onClose: () => void
}

export function BuildOptimizationModal({ analysis, onClose }: BuildOptimizationModalProps) {
  const [isPromptOpen, setIsPromptOpen] = useState(false)
  const { min, max } = analysis.estimatedTimeSavedSec

  return (
    <div className="flex flex-col">
      <Heading level={2} className="p-5 text-xl">
        Build optimization analysis
      </Heading>
      <div className="border-t border-neutral">
        <AnalysisRow iconName="gauge" label="Review confidence">
          <ConfidenceBadge confidence={analysis.confidence} />
        </AnalysisRow>
        <AnalysisRow iconName="clock" label="Estimated time saved">
          <span className="text-sm text-neutral">
            {formatDeploymentLogDuration(min)} – {formatDeploymentLogDuration(max)}
          </span>
        </AnalysisRow>
        <AnalysisRow iconName="file" label="Assets reviewed">
          <ul className="flex flex-wrap justify-end gap-2">
            {analysis.reviewedAssets.map((asset) => (
              <li key={asset}>
                <Badge className="bg-background text-ssm">{asset}</Badge>
              </li>
            ))}
          </ul>
        </AnalysisRow>
        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-col gap-2 text-sm text-neutral">
            <AnalysisLabel iconName="sparkles">Summary</AnalysisLabel>
            <p>{analysis.summary}</p>
            <Heading level={3}>Improvements target</Heading>
            <ol className="list-decimal pl-5">
              {analysis.improvements.map((improvement) => (
                <li key={improvement}>{improvement}</li>
              ))}
            </ol>
          </div>
          <div className="rounded-lg border border-neutral bg-surface-neutral-subtle">
            <div className="flex items-center justify-between gap-4 py-2 pl-3 pr-2">
              <button
                type="button"
                className="flex flex-1 items-center gap-1.5 text-left text-sm font-medium text-neutral-subtle"
                aria-expanded={isPromptOpen}
                onClick={() => setIsPromptOpen((isOpen) => !isOpen)}
              >
                <Icon iconName={isPromptOpen ? 'angle-down' : 'angle-right'} iconStyle="regular" className="w-3.5" />
                Prompt for AI agents
              </button>
              <CopyPromptButton prompt={analysis.agentPrompt} />
            </div>
            {isPromptOpen && (
              <p className="whitespace-pre-wrap border-t border-neutral px-3 py-2 font-code text-xs text-neutral">
                {analysis.agentPrompt}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-end border-t border-neutral px-5 py-4">
        <Button size="lg" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  )
}

export default BuildOptimizationModal
