import * as Dialog from '@radix-ui/react-dialog'
import { type ScalarFieldSchemaResponse } from 'qovery-typescript-axios'
import { useEffect, useState } from 'react'
import { Button } from '../button/button'
import { CodeEditor } from '../code-editor/code-editor'
import { useModal } from '../modal/use-modal/use-modal'

interface CatalogYamlInputProps {
  field: ScalarFieldSchemaResponse
  value: string
  onChange: (value: string) => void
  error?: string
  path: string
}

interface CatalogYamlEditorProps {
  field: ScalarFieldSchemaResponse
  value: string
  onApply: (value: string) => void
  onClose: () => void
}

export function CatalogYamlEditor({ field, value, onApply, onClose }: CatalogYamlEditorProps) {
  const [content, setContent] = useState(value)
  const { enableAlertClickOutside } = useModal()
  const isDirty = content !== value

  useEffect(() => {
    enableAlertClickOutside(isDirty)
    return () => enableAlertClickOutside(false)
  }, [isDirty, enableAlertClickOutside])

  return (
    <div className="p-5">
      <Dialog.Title className="h4 pr-8 text-neutral">Edit {field.label}</Dialog.Title>
      <Dialog.Description className="mb-6 mt-2 text-sm text-neutral-subtle">
        Apply your changes, then save the component configuration.
      </Dialog.Description>
      {field.templates?.length ? (
        <div className="mb-4 flex flex-col gap-2">
          <p className="text-sm font-medium">Start from a template</p>
          <div className="flex flex-wrap gap-2">
            {field.templates.map((template) => (
              <Button
                key={template.id}
                type="button"
                size="sm"
                variant="outline"
                disabled={content.length > 0}
                onClick={() => setContent(template.value)}
              >
                {template.label}
              </Button>
            ))}
          </div>
          <p className="text-ssm text-neutral-subtle">
            {content.length > 0
              ? 'Clear the editor to use a template. Existing content is never replaced automatically.'
              : 'Templates are starting points. Fill in the required values before saving.'}
          </p>
        </div>
      ) : null}
      <CodeEditor
        language="yaml"
        height="35vh"
        value={content}
        onChange={(next) => setContent(next ?? '')}
        options={{ ariaLabel: `${field.label} YAML`, wordWrap: 'on', scrollBeyondLastLine: false }}
      />
      <div className="mt-6 flex justify-end gap-3">
        <Button type="button" variant="plain" size="lg" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={() => {
            onApply(content)
            onClose()
          }}
        >
          Apply
        </Button>
      </div>
    </div>
  )
}

export function CatalogYamlInput({ field, value, onChange, error, path }: CatalogYamlInputProps) {
  const { openModal, closeModal } = useModal()

  return (
    <section aria-labelledby={`${path}-label`} className="flex min-w-0 flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <h4 id={`${path}-label`} className="text-sm font-medium">
          {field.label}
        </h4>
        <Button
          type="button"
          size="sm"
          variant="outline"
          aria-label={`Edit ${field.label} YAML`}
          aria-describedby={error ? `${path}-error` : undefined}
          onClick={() =>
            openModal({
              options: { width: Math.min(900, window.innerWidth - 48) },
              content: <CatalogYamlEditor field={field} value={value} onApply={onChange} onClose={closeModal} />,
            })
          }
        >
          {value ? 'Edit YAML' : 'Add YAML'}
        </Button>
      </div>
      {field.description ? <p className="text-ssm text-neutral-subtle">{field.description}</p> : null}
      {error ? (
        <p id={`${path}-error`} role="alert" className="text-xs text-negative">
          {error}
        </p>
      ) : null}
    </section>
  )
}
