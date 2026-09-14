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
}: {
  schema?: ArrayFieldSchemaResponse
  initial?: unknown[]
}) {
  const [value, setValue] = useState<unknown>(initial)
  return (
    <>
      <CatalogConfigurationInput
        field={schema}
        value={value}
        onChange={setValue}
        getError={(path) => (path === 'pools[1].name' ? 'Name already used' : undefined)}
      />
      <output>{JSON.stringify(value)}</output>
    </>
  )
}

describe('CatalogConfigurationInput', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('adds typed object rows, edits without losing siblings, and enforces collection limits', async () => {
    const { userEvent } = renderWithProviders(<Editor />)
    expect(screen.getByRole('button', { name: 'Remove NodePools 1' })).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: 'Add item to NodePools' }))
    expect(screen.getByRole('button', { name: 'Add item to NodePools' })).toBeDisabled()
    await userEvent.type(screen.getAllByRole('textbox', { name: 'Name' })[1], 'second')
    expect(JSON.parse(screen.getByRole('status').textContent ?? 'null')).toEqual([
      { name: 'first' },
      { name: 'second', size: 2 },
    ])
    expect(screen.getByText('Name already used')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Remove NodePools 1' }))
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('second')
    expect(screen.getByRole('spinbutton', { name: 'Size' })).toHaveValue(2)
  })

  it('uses evaluated fields specific to each row', () => {
    renderWithProviders(
      <Editor
        schema={{ ...field, itemFields: [[name], [name, { ...name, key: 'ami', label: 'AMI ID' }]] }}
        initial={[{ name: 'alias' }, { name: 'custom', ami: 'ami-123' }]}
      />
    )
    expect(screen.getAllByRole('textbox', { name: 'Name' })).toHaveLength(2)
    expect(screen.getByRole('textbox', { name: 'AMI ID' })).toHaveValue('ami-123')
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument()
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
