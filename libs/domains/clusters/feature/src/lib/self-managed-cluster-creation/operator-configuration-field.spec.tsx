import { type FieldSchemaResponse } from 'qovery-typescript-axios'
import { useState } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { OperatorConfigurationField } from './operator-configuration-field'

const scalarItemField = {
  key: 'name',
  label: 'Name',
  type: 'string',
  required: true,
  sensitive: false,
  constraints: {},
}

function createArrayField(itemFields: unknown[]) {
  return {
    key: 'listeners',
    label: 'Listeners',
    type: 'array',
    required: false,
    sensitive: false,
    constraints: {},
    items: { type: 'object', fields: itemFields },
    itemFields: [],
  } as unknown as FieldSchemaResponse
}

describe('OperatorConfigurationField', () => {
  it('adds, edits and removes items while keeping their summaries in sync', async () => {
    function Form() {
      const [value, setValue] = useState<unknown>([])
      return (
        <OperatorConfigurationField
          field={createArrayField([scalarItemField])}
          path="listeners"
          value={value}
          violations={[]}
          onChange={setValue}
        />
      )
    }
    const { userEvent } = renderWithProviders(<Form />)
    expect(screen.getByText('No items added')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Add item', exact: true }))
    await userEvent.type(await screen.findByLabelText('Name'), 'https')
    await userEvent.click(screen.getByRole('button', { name: 'Add', exact: true }))
    expect(await screen.findByText('Name: https')).toBeInTheDocument()
    expect(screen.getByText('https')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Edit https' }))
    await userEvent.clear(await screen.findByLabelText('Name'))
    await userEvent.type(screen.getByLabelText('Name'), 'http')
    await userEvent.click(screen.getByRole('button', { name: 'Save', exact: true }))
    expect(await screen.findByText('Name: http')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Remove http' }))
    expect(screen.getByText('No items added')).toBeInTheDocument()
  })
})
