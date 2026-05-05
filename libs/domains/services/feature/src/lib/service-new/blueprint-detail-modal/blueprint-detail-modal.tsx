import { Badge, Button, Heading, Icon, Section, TablePrimitives } from '@qovery/shared/ui'
import { type BlueprintEntry, PROVIDER_CONFIG, SERVICE_KIND_LABELS } from '../blueprints'

export interface BlueprintDetailModalProps {
  blueprint: BlueprintEntry
  onClose: () => void
  onUse: (blueprintId: string) => void
}

function extractReadmeTitle(markdown: string): string | null {
  const titleMatch = markdown.match(/^#\s+(.+)$/m)
  const rawTitle = titleMatch?.[1]?.trim()
  if (!rawTitle) return null

  return rawTitle.replace(/\s*[—-]\s*blueprint\s*v\d+(\.\d+)*\s*$/i, '').trim()
}

function extractReadmeDescription(markdown: string): string | null {
  const lines = markdown.split('\n')
  const firstTitleIndex = lines.findIndex((line) => line.trim().startsWith('# '))
  if (firstTitleIndex === -1) return null

  const linesAfterTitle = lines.slice(firstTitleIndex + 1)
  let paragraphLines: string[] = []
  let started = false

  for (const line of linesAfterTitle) {
    const trimmed = line.trim()
    if (!started) {
      if (!trimmed || trimmed === '---') continue
      if (trimmed.startsWith('#')) break
      paragraphLines.push(trimmed)
      started = true
      continue
    }

    if (!trimmed || trimmed === '---' || trimmed.startsWith('#')) break
    paragraphLines.push(trimmed)
  }

  const paragraph = paragraphLines.join(' ').trim()
  return paragraph || null
}

function extractReadmeSection(markdown: string | undefined, sectionTitle: string): string {
  if (!markdown) return ''

  const escaped = sectionTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`##\\s*${escaped}\\s*([\\s\\S]*?)(?=\\n##\\s|$)`, 'i')
  const match = markdown.match(regex)

  return match?.[1]?.trim() ?? ''
}

function parseResourceRows(text: string): Array<{ name: string; description: string }> {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith('```'))
    .map((line) => line.match(/^(.+?)\s*→\s*(.+)$/))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map((match) => ({
      name: match[1].trim(),
      description: match[2].trim(),
    }))
}

function parseMarkdownTable(text: string): { headers: string[]; rows: string[][] } | null {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('|'))

  if (lines.length < 3) return null

  const splitRow = (line: string) =>
    line
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim())

  const headers = splitRow(lines[0])
  const body = lines.slice(2).map(splitRow)

  if (headers.length === 0 || body.length === 0) return null

  return { headers, rows: body }
}

function extractFirstCodeBlock(sectionText: string): string {
  const match = sectionText.match(/```[\w-]*\n([\s\S]*?)```/)
  return match?.[1]?.trim() ?? ''
}

function extractBulletItems(sectionText: string): string[] {
  return sectionText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => line.replace(/^-+\s*/, '').trim())
}

function extractParagraphText(sectionText: string): string[] {
  const lines = sectionText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith('|'))
    .filter((line) => !line.startsWith('- '))
    .filter((line) => !line.startsWith('```'))

  const paragraphs: string[] = []
  let current = ''

  for (const line of lines) {
    if (!current) {
      current = line
      continue
    }
    if (line.endsWith(':')) {
      paragraphs.push(current)
      current = line
      continue
    }
    current += ` ${line}`
  }

  if (current) paragraphs.push(current)
  return paragraphs
}

function renderTable(headers: string[], rows: string[][]) {
  return (
    <TablePrimitives.Table.Root className="text-sm" containerClassName="rounded border border-neutral bg-surface-neutral">
      <TablePrimitives.Table.Header className="bg-surface-neutral">
        <TablePrimitives.Table.Row>
          {headers.map((header) => (
            <TablePrimitives.Table.ColumnHeaderCell
              key={header}
              className="h-11 border-r border-neutral bg-surface-neutral px-3 text-xs font-medium font-mono text-neutral last:border-r-0"
            >
              {header}
            </TablePrimitives.Table.ColumnHeaderCell>
          ))}
        </TablePrimitives.Table.Row>
      </TablePrimitives.Table.Header>
      <TablePrimitives.Table.Body>
        {rows.map((row, rowIndex) => (
          <TablePrimitives.Table.Row key={`${row[0]}-${rowIndex}`}>
            {row.map((cell, cellIndex) => (
              <TablePrimitives.Table.Cell
                key={`${cell}-${cellIndex}`}
                className="h-auto border-r border-neutral bg-surface-neutral px-3 py-2 text-sm text-neutral last:border-r-0"
              >
                {cell}
              </TablePrimitives.Table.Cell>
            ))}
          </TablePrimitives.Table.Row>
        ))}
      </TablePrimitives.Table.Body>
    </TablePrimitives.Table.Root>
  )
}

function renderSectionTitle(title: string) {
  return (
    <Heading level={2} className="mb-3">
      {title}
    </Heading>
  )
}

export function BlueprintDetailModal({ blueprint, onClose, onUse }: BlueprintDetailModalProps) {
  const providerCfg = PROVIDER_CONFIG[blueprint.provider]
  const readme = blueprint.readme ?? ''
  const title = extractReadmeTitle(readme) ?? blueprint.name
  const description = extractReadmeDescription(readme) ?? blueprint.description

  const createsSection = extractReadmeSection(readme, 'What this blueprint creates')
  const architectureSection = extractReadmeSection(readme, 'Architecture')
  const parametersSection = extractReadmeSection(readme, 'Parameters')
  const outputsSection = extractReadmeSection(readme, 'Outputs')
  const securityDefaultsSection = extractReadmeSection(readme, 'Security defaults')
  const namingConstraintsSection = extractReadmeSection(readme, 'Naming constraints')
  const usageNotesSection = extractReadmeSection(readme, 'Usage notes')

  const createsRows = parseResourceRows(createsSection)
  const parametersTable = parseMarkdownTable(parametersSection)
  const outputsTable = parseMarkdownTable(outputsSection)
  const architectureCode = extractFirstCodeBlock(architectureSection)
  const securityItems = extractBulletItems(securityDefaultsSection)
  const namingParagraphs = extractParagraphText(namingConstraintsSection)
  const namingItems = extractBulletItems(namingConstraintsSection)
  const usageItems = extractBulletItems(usageNotesSection)

  const repositoryLabel = blueprint.repositorySlug ?? 'Blueprint repository'

  return (
    <Section className="flex h-full flex-col gap-0 p-0">
      <div className="flex-1 overflow-auto p-6 pb-24 text-sm">
        <div className="border-b border-neutral pb-5">
          <div className="mb-2 flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-surface-neutral-component">
              {providerCfg.icon ? (
                <img src={providerCfg.icon} alt={providerCfg.label} className="h-6 w-6 select-none object-contain" />
              ) : (
                <Icon iconName="layer-group" className="text-sm text-brand" />
              )}
            </span>
            <Heading className="text-2xl leading-8">{title}</Heading>
          </div>

          <p className="leading-5 text-neutral-subtle">{description}</p>

          <div className="mt-5 flex flex-wrap items-center gap-1.5">
            <Badge size="base" color="neutral" variant="outline" className="gap-1">
              <Icon iconStyle="brands" iconName="github" />
              {repositoryLabel}
            </Badge>
            <Badge size="base" color="neutral" variant="outline" className="gap-1">
              {providerCfg.icon ? <img src={providerCfg.icon} alt={providerCfg.label} width={12} height={12} /> : null}
              {providerCfg.label}
            </Badge>
            <Badge size="base" color="neutral" variant="outline" className="gap-1">
              <Icon iconName="puzzle-piece" />
              {SERVICE_KIND_LABELS[blueprint.serviceKind]}
            </Badge>
          </div>
        </div>

        {createsRows.length > 0 && (
          <div className="mt-5">
            {renderSectionTitle('What this blueprint creates')}
            <TablePrimitives.Table.Root className="text-sm" containerClassName="rounded border border-neutral bg-surface-neutral">
              <TablePrimitives.Table.Body>
                {createsRows.map((row, index) => (
                  <TablePrimitives.Table.Row key={`${row.name}-${index}`}>
                    <TablePrimitives.Table.Cell className="h-auto w-1/2 border-r border-neutral px-3 py-2">
                      <span className="font-mono text-sm text-neutral">{row.name}</span>
                    </TablePrimitives.Table.Cell>
                    <TablePrimitives.Table.Cell className="h-auto w-1/2 bg-surface-neutral px-3 py-2 text-neutral">
                      {row.description}
                    </TablePrimitives.Table.Cell>
                  </TablePrimitives.Table.Row>
                ))}
              </TablePrimitives.Table.Body>
            </TablePrimitives.Table.Root>
          </div>
        )}

        {architectureCode && (
          <div className="mt-5">
            {renderSectionTitle('Architecture')}
            <div className="rounded border border-neutral bg-surface-neutral-subtle p-4">
              <pre className="overflow-x-auto whitespace-pre font-mono text-sm leading-5 text-neutral-subtle">{architectureCode}</pre>
            </div>
          </div>
        )}

        {parametersTable && (
          <div className="mt-5">
            {renderSectionTitle('Parameters')}
            {renderTable(parametersTable.headers, parametersTable.rows)}
          </div>
        )}

        {outputsTable && (
          <div className="mt-5">
            {renderSectionTitle('Outputs')}
            {renderTable(outputsTable.headers, outputsTable.rows)}
          </div>
        )}

        {(securityItems.length > 0 || securityDefaultsSection) && (
          <div className="mt-5">
            {renderSectionTitle('Security defaults')}
            {securityItems.length > 0 ? (
              <ul className="list-disc space-y-2 pl-5 text-neutral">
                {securityItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-neutral">{securityDefaultsSection}</p>
            )}
          </div>
        )}

        {(namingParagraphs.length > 0 || namingItems.length > 0) && (
          <div className="mt-5">
            {renderSectionTitle('Naming constraints')}
            {namingParagraphs.map((paragraph) => (
              <p key={paragraph} className="text-neutral">
                {paragraph}
              </p>
            ))}
            {namingItems.length > 0 && (
              <ul className="mt-2 list-disc space-y-2 pl-5 text-neutral">
                {namingItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {usageItems.length > 0 && (
          <div className="mt-5">
            {renderSectionTitle('Usage notes')}
            <ul className="list-disc space-y-2 pl-5 text-neutral">
              {usageItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 border-t border-neutral bg-background px-6 py-4">
        <div className="flex items-center justify-end gap-2">
          <Button size="md" color="neutral" variant="plain" radius="rounded" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="md"
            color="brand"
            variant="solid"
            radius="rounded"
            onClick={() => {
              onUse(blueprint.id)
              onClose()
            }}
          >
            Deploy blueprint
          </Button>
        </div>
      </div>
    </Section>
  )
}

export default BlueprintDetailModal
