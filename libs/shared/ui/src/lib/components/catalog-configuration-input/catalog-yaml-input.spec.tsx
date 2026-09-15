import { type EditorProps } from '@monaco-editor/react'
import {
  type ArrayFieldSchemaResponse,
  type FieldSchemaResponse,
  type ScalarFieldSchemaResponse,
} from 'qovery-typescript-axios'
import { useState } from 'react'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { CatalogConfigurationInput } from './catalog-configuration-input'

// Monaco requires browser layout and workers. Keep its controlled value/onChange boundary real.
jest.mock('@monaco-editor/react', () => ({
  Editor: ({ value, onChange, options }: EditorProps) => (
    <textarea
      aria-label={options?.ariaLabel}
      value={value}
      onChange={(event) => onChange?.(event.target.value, {} as Parameters<NonNullable<EditorProps['onChange']>>[1])}
    />
  ),
}))

const yaml: ScalarFieldSchemaResponse = {
  key: 'manifest',
  label: 'Manifest',
  type: 'string',
  required: true,
  sensitive: false,
  constraints: {},
  format: 'kubernetes-resource-yaml',
  templates: [
    { id: 'example', label: 'Example resource', value: 'apiVersion: example.io/v1\nkind: Example\nspec: {}\n' },
  ],
}

function Editor({ field = yaml, initial }: { field?: FieldSchemaResponse; initial?: unknown }) {
  const [value, setValue] = useState(initial)
  return (
    <>
      <CatalogConfigurationInput field={field} value={value} onChange={setValue} />
      <output>{JSON.stringify(value)}</output>
    </>
  )
}

describe('Catalog YAML editor', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('requires explicit template selection and only applies the draft on confirmation', async () => {
    const { userEvent } = renderWithProviders(<Editor />)
    expect(screen.getByRole('status', { hidden: true })).toBeEmptyDOMElement()
    await userEvent.click(screen.getByRole('button', { name: 'Edit Manifest YAML' }))
    expect(screen.getByRole('textbox', { name: 'Manifest YAML' })).toHaveValue('')
    await userEvent.click(screen.getByRole('button', { name: 'Example resource' }))
    expect(screen.getByRole('textbox', { name: 'Manifest YAML' })).toHaveValue(yaml.templates?.[0].value)
    expect(screen.getByRole('status', { hidden: true })).toBeEmptyDOMElement()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Apply' })).toBeEnabled())
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(JSON.parse(screen.getByRole('status', { hidden: true }).textContent ?? 'null')).toBe(
      yaml.templates?.[0].value
    )
  })

  it('preserves saved comments and formatting, prevents template replacement, and cancels edits', async () => {
    const saved = '# my comment\nspec:\n  message: "{{ untouched }}"\n'
    const { userEvent } = renderWithProviders(<Editor initial={saved} />)
    await userEvent.click(screen.getByRole('button', { name: 'Edit Manifest YAML' }))
    const input = screen.getByRole('textbox', { name: 'Manifest YAML' })
    expect(input).toHaveValue(saved)
    expect(screen.getByRole('button', { name: 'Example resource' })).toBeDisabled()
    await userEvent.clear(input)
    await userEvent.type(input, 'changed')
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(JSON.parse(screen.getByRole('status', { hidden: true }).textContent ?? 'null')).toBe(saved)
    await userEvent.click(screen.getByRole('button', { name: 'Edit Manifest YAML' }))
    expect(screen.getByRole('textbox', { name: 'Manifest YAML' })).toHaveValue(saved)
  })

  it('selects the YAML editor without templates and allows clearing an optional value', async () => {
    const { userEvent } = renderWithProviders(
      <Editor field={{ ...yaml, required: false, templates: undefined }} initial="spec: {}" />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Edit Manifest YAML' }))
    expect(screen.queryByText('Start from a template')).not.toBeInTheDocument()
    await userEvent.clear(screen.getByRole('textbox', { name: 'Manifest YAML' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Apply' })).toBeEnabled())
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(JSON.parse(screen.getByRole('status', { hidden: true }).textContent ?? 'null')).toBe('')
  })

  it('keeps unknown formats on the ordinary string editor', () => {
    renderWithProviders(<Editor field={{ ...yaml, format: 'future-editor' }} initial="existing" />)
    expect(screen.getByRole('textbox', { name: 'Manifest' })).toHaveValue('existing')
    expect(screen.queryByRole('button', { name: 'Edit Manifest YAML' })).not.toBeInTheDocument()
  })

  it('edits and removes array rows without losing sibling manifests', async () => {
    const resources: ArrayFieldSchemaResponse = {
      key: 'resources',
      label: 'Resources',
      type: 'array',
      required: false,
      sensitive: false,
      constraints: {},
      items: { type: 'object', fields: [yaml] },
    }
    const saved = '# preserve me\nspec: {}\n'
    const { userEvent } = renderWithProviders(<Editor field={resources} initial={[{ manifest: saved }]} />)
    await userEvent.click(screen.getByRole('button', { name: 'Add item to Resources' }))
    await userEvent.click(screen.getAllByRole('button', { name: 'Edit Manifest YAML' })[1])
    const input = screen.getByRole('textbox', { name: 'Manifest YAML' })
    await userEvent.click(input)
    await userEvent.paste('# second\nspec: [broken')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Apply' })).toBeEnabled())
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(JSON.parse(screen.getByRole('status', { hidden: true }).textContent ?? 'null')).toEqual([
      { manifest: saved },
      { manifest: '# second\nspec: [broken' },
    ])
    await userEvent.click(screen.getByRole('button', { name: 'Remove Resources 1' }))
    expect(JSON.parse(screen.getByRole('status', { hidden: true }).textContent ?? 'null')).toEqual([
      { manifest: '# second\nspec: [broken' },
    ])
  })

  it('shows indexed resolver errors beside the corresponding YAML field', () => {
    renderWithProviders(
      <CatalogConfigurationInput
        field={yaml}
        path="resources[1].manifest"
        value="spec: [broken"
        onChange={jest.fn()}
        getError={(path) => (path === 'resources[1].manifest' ? 'Supply one YAML object' : undefined)}
      />
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Supply one YAML object')
    expect(screen.getByRole('button', { name: 'Edit Manifest YAML' })).toHaveAccessibleDescription(
      'Supply one YAML object'
    )
  })
})
