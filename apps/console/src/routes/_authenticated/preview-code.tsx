import { createFileRoute, useLocation } from '@tanstack/react-router'
import { z } from 'zod'
import { CodeEditor, CopyToClipboardButtonIcon, EmptyState, Heading, Section } from '@qovery/shared/ui'
import { useDocumentTitle } from '@qovery/shared/util-hooks'

interface PreviewCodeRouteState {
  code?: string
}

const previewCodeSearchSchema = z.object({
  language: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
})

type PreviewCodeRouteSearch = z.infer<typeof previewCodeSearchSchema>

function isPreviewCodeRouteState(value: unknown): value is PreviewCodeRouteState {
  return typeof value === 'object' && value !== null && (!('code' in value) || typeof value.code === 'string')
}

function getPreviewCodeState(state: unknown): PreviewCodeRouteState | undefined {
  return isPreviewCodeRouteState(state) ? state : undefined
}

function getPreviewMetadata(search: PreviewCodeRouteSearch) {
  return {
    title: search.title ?? 'Preview code',
    description: search.description ?? 'Read-only preview.',
    language: search.language ?? 'yaml',
  }
}

function hasPreviewContent(state?: PreviewCodeRouteState, search?: PreviewCodeRouteSearch) {
  return Boolean(state?.code || search?.title || search?.description || search?.language)
}

interface PreviewCodeHeaderProps {
  title: string
  description: string
  language: string
  code: string
}

function PreviewCodeHeader({ title, description, language, code }: PreviewCodeHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-neutral bg-surface-neutral-subtle px-6 py-4">
      <Section className="min-w-0">
        <Heading className="mb-1">{title}</Heading>
        <p className="text-sm text-neutral-subtle">{description}</p>
      </Section>

      <div className="flex items-center gap-3">
        <span className="rounded-full border border-neutral bg-surface-neutral-component px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-neutral-subtle">
          {language}
        </span>
        <CopyToClipboardButtonIcon content={code} className="text-neutral-subtle hover:text-neutral" />
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/preview-code')({
  component: PreviewCode,
  validateSearch: previewCodeSearchSchema,
})

function PreviewCode() {
  const location = useLocation()
  const state = getPreviewCodeState(location.state)
  const search = Route.useSearch()
  const { title, description, language } = getPreviewMetadata(search)
  const code = state?.code ?? ''

  useDocumentTitle(title)

  if (!hasPreviewContent(state, search)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <EmptyState
          title="No preview available"
          description="Open this page from a preview action to display the generated code."
          icon="circle-info"
          className="h-auto max-w-lg"
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PreviewCodeHeader title={title} description={description} language={language} code={code} />

      <div className="min-h-0 flex-1">
        <CodeEditor language={language} value={code} height="calc(100vh - 89px)" readOnly />
      </div>
    </div>
  )
}
