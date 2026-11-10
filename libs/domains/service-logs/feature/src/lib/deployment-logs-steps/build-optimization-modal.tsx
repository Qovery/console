import { type IconName } from '@fortawesome/fontawesome-common-types'
import {
  type BuildAnalysisAsset,
  type BuildAnalysisConfidence,
  type BuildAnalysisResult,
} from 'qovery-typescript-axios'
import { type PropsWithChildren, useEffect, useState } from 'react'
import { match } from 'ts-pattern'
import { Badge, Button, Heading, Icon } from '@qovery/shared/ui'
import { useCopyToClipboard } from '@qovery/shared/util-hooks'
import { formatDeploymentLogDuration } from '../utils/deployment-log-steps'

const ASSET_LABELS: Record<BuildAnalysisAsset, string> = {
  DOCKERFILE: 'Dockerfile',
  DOCKERIGNORE: '.dockerignore',
  BUILD_LOGS: 'Build logs',
  BUILD_SETTINGS: 'Build settings',
}

// Same style as the inline code of the rest of the console
const INLINE_CODE_CLASS_NAME = 'rounded bg-surface-neutral-component px-1 py-0.5 font-mono text-xs'

// The analysis wraps commands, paths and variable names in backticks, like Markdown inline code
function TextWithInlineCode({ text }: { text: string }) {
  const parts = text.split('`')
  // An unmatched backtick stays as it is
  if (parts.length % 2 === 0) {
    const lastPart = parts.pop()
    parts[parts.length - 1] += '`' + lastPart
  }

  return parts.map((part, index) =>
    index % 2 === 1 && part ? (
      <code key={index} className={INLINE_CODE_CLASS_NAME}>
        {part}
      </code>
    ) : (
      part
    )
  )
}

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

function ConfidenceBadge({ confidence }: { confidence: BuildAnalysisConfidence }) {
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

function CopyButton({ content }: { content: string }) {
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
        copyToClipboard(content)
        setIsCopied(true)
      }}
    >
      <Icon iconName={isCopied ? 'check' : 'copy'} iconStyle="regular" />
      {isCopied ? 'Copied' : 'Copy'}
    </Button>
  )
}

// A block to expand and copy, like a prompt or a file
function CollapsibleCodeBlock({ title, content }: { title: string; content: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="rounded-lg border border-neutral bg-surface-neutral-subtle">
      <div className="flex items-center justify-between gap-4 py-2 pl-3 pr-2">
        <button
          type="button"
          className="flex flex-1 items-center gap-1.5 text-left text-sm font-medium text-neutral-subtle"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((isOpen) => !isOpen)}
        >
          <Icon iconName={isOpen ? 'angle-down' : 'angle-right'} iconStyle="regular" className="w-3.5" />
          {title}
        </button>
        <CopyButton content={content} />
      </div>
      {isOpen && (
        <p className="whitespace-pre-wrap border-t border-neutral px-3 py-2 font-code text-xs text-neutral">
          {content}
        </p>
      )}
    </div>
  )
}

export interface BuildOptimizationModalProps {
  analysis: BuildAnalysisResult
  onClose: () => void
}

export function BuildOptimizationModal({ analysis, onClose }: BuildOptimizationModalProps) {
  const timeSaved = analysis.estimated_time_saved

  return (
    <div className="flex flex-col">
      <Heading level={2} className="p-5 text-xl">
        Build optimization analysis
      </Heading>
      <div className="border-t border-neutral">
        <AnalysisRow iconName="gauge" label="Review confidence">
          <ConfidenceBadge confidence={analysis.confidence} />
        </AnalysisRow>
        {/* Nothing to save, or no timing to base it on */}
        {timeSaved && (
          <AnalysisRow iconName="clock" label="Estimated time saved">
            <span className="text-sm text-neutral">
              {timeSaved.min_seconds === timeSaved.max_seconds
                ? formatDeploymentLogDuration(timeSaved.max_seconds)
                : `${formatDeploymentLogDuration(timeSaved.min_seconds)} – ${formatDeploymentLogDuration(timeSaved.max_seconds)}`}
            </span>
          </AnalysisRow>
        )}
        <AnalysisRow iconName="file" label="Assets reviewed">
          <ul className="flex flex-wrap justify-end gap-2">
            {analysis.assets_reviewed.map((asset) => (
              <li key={asset}>
                <Badge className="bg-background text-ssm">{ASSET_LABELS[asset] ?? asset}</Badge>
              </li>
            ))}
          </ul>
        </AnalysisRow>
        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-col gap-2 text-sm text-neutral">
            <AnalysisLabel iconName="sparkles">Summary</AnalysisLabel>
            <p>
              <TextWithInlineCode text={analysis.summary} />
            </p>
            <Heading level={3}>Improvements target</Heading>
            {analysis.improvements.length > 0 ? (
              <ol className="list-decimal pl-5">
                {analysis.improvements.map((improvement) => (
                  <li key={improvement}>
                    <TextWithInlineCode text={improvement} />
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-neutral-subtle">No improvement found: this build is already efficient.</p>
            )}
          </div>
          <CollapsibleCodeBlock title="Prompt for AI agents" content={analysis.agent_prompt} />
          {analysis.dockerfile && (
            <div className="flex flex-col gap-2">
              <CollapsibleCodeBlock title="Reworked Dockerfile" content={analysis.dockerfile} />
              {analysis.dockerfile_rationale && (
                <p className="text-sm text-neutral-subtle">
                  <TextWithInlineCode text={analysis.dockerfile_rationale} />
                </p>
              )}
              {analysis.dockerfile.includes('<redacted>') && (
                <p className="text-sm text-neutral-subtle">
                  Values hidden from the analysis appear as{' '}
                  <code className={INLINE_CODE_CLASS_NAME}>&lt;redacted&gt;</code>: put them back before using this
                  Dockerfile.
                </p>
              )}
            </div>
          )}
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
