import { type ArrayFieldSchemaResponse, type ScalarFieldSchemaResponse } from 'qovery-typescript-axios'
import { useMemo } from 'react'
import { parseDocument } from 'yaml'
import { isCatalogObject } from '@qovery/shared/util-js'
import { Button } from '../button/button'
import { useModal } from '../modal/use-modal/use-modal'
import { type CatalogConfigurationInputProps } from './catalog-configuration-input'
import { CatalogYamlEditor } from './catalog-yaml-input'

// Read display metadata only. Never serialize the document back or validate its CRD here.
export function getYamlResourceSummary(value: string) {
  try {
    const document = parseDocument(value, { logLevel: 'silent' })
    if (document.errors.length) return undefined
    const kind = document.get('kind')
    const apiVersion = document.get('apiVersion')
    const name = document.getIn(['metadata', 'name'])
    if (typeof kind !== 'string' || !kind || typeof apiVersion !== 'string' || !apiVersion) return undefined
    return { kind, apiVersion, name: typeof name === 'string' ? name : '' }
  } catch {
    return undefined
  }
}

export function CatalogYamlResourceList({
  field,
  manifestField,
  value,
  onChange,
  path = field.key,
  getError,
}: CatalogConfigurationInputProps & { field: ArrayFieldSchemaResponse; manifestField: ScalarFieldSchemaResponse }) {
  const { openModal, closeModal } = useModal()
  const rows = useMemo(() => (Array.isArray(value) ? value : []), [value])
  const groups = useMemo(() => {
    const entries = rows.map((row, index) => {
      const rawManifest = isCatalogObject(row) ? row[manifestField.key] : undefined
      const manifest = typeof rawManifest === 'string' ? rawManifest : ''
      return { index, manifest, summary: getYamlResourceSummary(manifest) }
    })
    // Template types remain visible even before the first resource is added.
    const types = new Map<string, { kind: string; apiVersion: string; template?: string }>()
    for (const template of manifestField.templates ?? []) {
      const summary = getYamlResourceSummary(template.value)
      if (summary) types.set(`${summary.apiVersion}/${summary.kind}`, { ...summary, template: template.value })
    }
    for (const { summary } of entries) {
      const key = summary ? `${summary.apiVersion}/${summary.kind}` : 'unrecognized'
      if (!types.has(key)) types.set(key, summary ?? { kind: 'Unrecognized resources', apiVersion: '' })
    }
    return Array.from(types, ([key, type]) => ({
      ...type,
      key,
      entries: entries.filter(
        ({ summary }) => (summary ? `${summary.apiVersion}/${summary.kind}` : 'unrecognized') === key
      ),
    }))
  }, [rows, manifestField])
  const addDisabled = field.constraints.maxItems != null && rows.length >= field.constraints.maxItems

  const edit = (manifest: string, index?: number) => {
    const rowField =
      index !== undefined && field.itemFields?.length === rows.length ? field.itemFields[index][0] : undefined
    const editorField = rowField?.type === 'string' ? rowField : manifestField
    openModal({
      options: { width: Math.min(900, window.innerWidth - 48) },
      content: (
        <CatalogYamlEditor
          field={editorField}
          value={manifest}
          onClose={closeModal}
          onApply={(next) => {
            if (index === undefined) {
              onChange([...rows, { [manifestField.key]: next }])
            } else {
              onChange(
                rows.map((row, candidate) =>
                  candidate === index ? { ...(isCatalogObject(row) ? row : {}), [manifestField.key]: next } : row
                )
              )
            }
          }}
        />
      ),
    })
  }

  return (
    <section aria-label={field.label} className="flex min-w-0 flex-col gap-4">
      <h4 className="text-sm font-medium">{field.label}</h4>
      {field.description ? <p className="text-ssm text-neutral-subtle">{field.description}</p> : null}
      {groups.map((group) => (
        <section key={group.key} aria-label={`${group.kind} ${group.apiVersion}`} className="min-w-0 pt-2">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-neutral pb-3">
            <div className="flex flex-col gap-1">
              <h5 className="text-base font-medium">{group.kind}</h5>
              <span className="text-xs text-neutral-subtle">{group.apiVersion}</span>
            </div>
            {group.template ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                aria-label={`Add ${group.kind}`}
                disabled={addDisabled}
                onClick={() => edit(group.template ?? '')}
              >
                Add
              </Button>
            ) : null}
          </div>
          {group.entries.length === 0 ? <p className="text-sm text-neutral-subtle">No resources yet.</p> : null}
          <ul className="divide-y divide-neutral">
            {group.entries.map(({ index, manifest, summary }) => {
              const name = summary?.name || `Unnamed resource ${index + 1}`
              const error = getError?.(`${path}[${index}].${manifestField.key}`) ?? getError?.(`${path}[${index}]`)
              return (
                <li key={index} className="py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="min-w-0 break-all text-sm">{name}</span>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        aria-label={`Edit ${name}`}
                        aria-describedby={error ? `${path}-${index}-error` : undefined}
                        onClick={() => edit(manifest, index)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="plain"
                        aria-label={`Remove ${name}`}
                        disabled={rows.length <= (field.constraints.minItems ?? 0)}
                        onClick={() => onChange(rows.filter((_, candidate) => candidate !== index))}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                  {!summary ? (
                    <p className="mt-1 text-xs text-neutral-subtle">Edit YAML to specify a resource type and name.</p>
                  ) : null}
                  {error ? (
                    <p id={`${path}-${index}-error`} role="alert" className="mt-1 text-xs text-negative">
                      {error}
                    </p>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </section>
      ))}
      {getError?.(path) ? (
        <p role="alert" className="text-xs text-negative">
          {getError(path)}
        </p>
      ) : null}
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="self-start"
        disabled={addDisabled}
        onClick={() => edit('')}
      >
        Add resource
      </Button>
    </section>
  )
}
