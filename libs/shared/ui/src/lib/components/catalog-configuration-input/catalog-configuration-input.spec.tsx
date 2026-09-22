import { type ArrayFieldSchemaResponse, type ScalarFieldSchemaResponse } from 'qovery-typescript-axios'
import { useState } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { CatalogConfigurationInput } from './catalog-configuration-input'

const name: ScalarFieldSchemaResponse = {
  key: 'name',
  label: 'Name',
  type: 'string',
  required: true,
  sensitive: false,
  constraints: {},
}
const field: ArrayFieldSchemaResponse = {
  key: 'pools',
  label: 'NodePools',
  type: 'array',
  required: true,
  sensitive: false,
  constraints: { minItems: 1, maxItems: 2, uniqueItems: false },
  items: { type: 'object', fields: [name, { ...name, key: 'size', label: 'Size', type: 'number', defaultValue: '2' }] },
}

function Editor({
  schema = field,
  initial = [{ name: 'first' }],
  getError,
}: {
  schema?: ArrayFieldSchemaResponse
  initial?: unknown[]
  getError?: (path: string) => string | undefined
}) {
  const [value, setValue] = useState<unknown>(initial)
  return (
    <>
      <CatalogConfigurationInput field={schema} value={value} onChange={setValue} getError={getError} />
      <output>{JSON.stringify(value)}</output>
    </>
  )
}

describe('CatalogConfigurationInput', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('adds typed object rows, edits without losing siblings, and enforces collection limits', async () => {
    const { userEvent } = renderWithProviders(
      <Editor getError={(path) => (path === 'pools[1].name' ? 'Name already used' : undefined)} />
    )
    expect(screen.getByRole('button', { name: 'Remove NodePools 1' })).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: 'Add item to NodePools' }))
    expect(screen.getByRole('button', { name: 'Add item to NodePools' })).toBeDisabled()
    await userEvent.type(screen.getByRole('textbox', { name: 'Name' }), 'second')
    expect(JSON.parse(screen.getByRole('status').textContent ?? 'null')).toEqual([
      { name: 'first' },
      { name: 'second', size: 2 },
    ])
    expect(screen.getByText('Name already used')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Remove NodePools 1' }))
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('second')
    expect(screen.getByRole('spinbutton', { name: 'Size' })).toHaveValue(2)
  })

  it('uses evaluated fields specific to each row', async () => {
    const { userEvent } = renderWithProviders(
      <Editor
        schema={{ ...field, itemFields: [[name], [name, { ...name, key: 'ami', label: 'AMI ID' }]] }}
        initial={[{ name: 'alias' }, { name: 'custom', ami: 'ami-123' }]}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: 'alias' }))
    await userEvent.click(screen.getByRole('button', { name: 'custom' }))
    expect(screen.getAllByRole('textbox', { name: 'Name' })).toHaveLength(2)
    expect(screen.getByRole('textbox', { name: 'AMI ID' })).toHaveValue('ami-123')
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument()
  })

  it('collapses existing objects by name and retains edits when reopened', async () => {
    const { userEvent } = renderWithProviders(<Editor />)
    expect(screen.getByRole('button', { name: 'first' })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'first' }))
    await userEvent.clear(screen.getByRole('textbox', { name: 'Name' }))
    await userEvent.type(screen.getByRole('textbox', { name: 'Name' }), 'renamed')
    await userEvent.click(screen.getByRole('button', { name: 'renamed' }))
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'renamed' }))
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('renamed')
  })

  it('opens newly added objects immediately without needing an error', async () => {
    const { userEvent } = renderWithProviders(<Editor />)
    await userEvent.click(screen.getByRole('button', { name: 'Add item to NodePools' }))
    expect(screen.getByRole('button', { name: 'NodePools 2' })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('')
    expect(screen.getByRole('button', { name: 'first' })).toHaveAttribute('aria-expanded', 'false')
  })

  it.each([true, false])(
    'does not expose a sensitive name in the summary (collection sensitive: %s)',
    (collectionSensitive) => {
      renderWithProviders(
        <Editor
          schema={{
            ...field,
            sensitive: collectionSensitive,
            items: { type: 'object', fields: [{ ...name, sensitive: !collectionSensitive }] },
          }}
        />
      )
      expect(screen.getByRole('button', { name: 'NodePools 1' })).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByText('first')).not.toBeInTheDocument()
    }
  )

  it('reveals errors inside nested lists when validation arrives after initial rendering', () => {
    const schema: ArrayFieldSchemaResponse = {
      ...field,
      items: { type: 'object', fields: [name, { ...field, key: 'children', label: 'Children' }] },
    }
    const initial = [{ name: 'parent', children: [{ name: 'child' }] }]
    const { rerender } = renderWithProviders(<Editor schema={schema} initial={initial} />)
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    rerender(
      <Editor
        schema={schema}
        initial={initial}
        getError={(path) => (path === 'pools[0].children[0].name' ? 'Invalid child name' : undefined)}
      />
    )
    expect(screen.getByText('Invalid child name')).toBeVisible()
    expect(screen.getByRole('button', { name: 'parent Action required' })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: 'child Action required' })).toHaveAttribute('aria-expanded', 'true')
  })

  it('edits scalar arrays as typed values', async () => {
    const { userEvent } = renderWithProviders(
      <Editor schema={{ ...field, items: { type: 'number', constraints: {} } }} initial={[3]} />
    )
    const input = screen.getByRole('spinbutton', { name: 'NodePools 1' })
    await userEvent.clear(input)
    await userEvent.type(input, '42')
    expect(JSON.parse(screen.getByRole('status').textContent ?? 'null')).toEqual([42])
  })

  it('shows enum choices outside the clipping object accordion and saves the selected effect', async () => {
    const effects = ['NoSchedule', 'PreferNoSchedule', 'NoExecute']
    const { container, userEvent } = renderWithProviders(
      <Editor
        schema={{
          ...field,
          key: 'tolerations',
          label: 'Tolerations',
          items: {
            type: 'object',
            fields: [
              { ...name, key: 'key', label: 'Taint key' },
              { ...name, key: 'value', label: 'Taint value' },
              { ...name, key: 'effect', label: 'Effect', constraints: { allowedValues: effects } },
            ],
          },
        }}
        initial={[]}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Add item to Tolerations' }))
    await userEvent.type(screen.getByRole('textbox', { name: 'Taint key' }), 'node.qovery.com/infrastructure')
    await userEvent.type(screen.getByRole('textbox', { name: 'Taint value' }), 'true')
    await userEvent.click(screen.getByRole('combobox', { name: 'Effect' }))

    for (const effect of effects) {
      expect(screen.getByRole('option', { name: effect })).toBeInTheDocument()
    }
    expect(container).not.toContainElement(screen.getByRole('listbox'))

    await userEvent.click(screen.getByText('NoSchedule'))
    expect(JSON.parse(screen.getByRole('status').textContent ?? 'null')).toEqual([
      { key: 'node.qovery.com/infrastructure', value: 'true', effect: 'NoSchedule' },
    ])
  })

  it('searches catalog choices in array rows without preselecting or replacing existing instances', async () => {
    const { userEvent } = renderWithProviders(
      <Editor
        schema={{
          ...field,
          key: 'instanceTypes',
          label: 'Instance types',
          items: { type: 'string', constraints: { allowedValues: ['m5.large', 'c7i-flex.large'] } },
        }}
        initial={['m5.large']}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Add item to Instance types' }))
    expect(JSON.parse(screen.getByRole('status').textContent ?? 'null')).toEqual(['m5.large', ''])
    await userEvent.type(screen.getByRole('combobox', { name: 'Instance types 2' }), 'c7i')
    expect(screen.queryByRole('option', { name: 'm5.large' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByText('c7i-flex.large'))
    expect(JSON.parse(screen.getByRole('status').textContent ?? 'null')).toEqual(['m5.large', 'c7i-flex.large'])
  })
})
