import { type FieldSchemaResponse } from 'qovery-typescript-axios'
import { useState } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { ProfileConfigurationField } from './profile-configuration-field'

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

describe('ProfileConfigurationField', () => {
  it('lets object items with scalar fields be added', () => {
    renderWithProviders(
      <ProfileConfigurationField
        field={createArrayField([scalarItemField])}
        path="listeners"
        value={[]}
        violations={[]}
        onChange={jest.fn()}
      />
    )

    expect(screen.getByRole('button', { name: 'Add item to Listeners' })).toBeEnabled()
  })

  it('does not add object items whose nested settings the modal cannot edit', () => {
    renderWithProviders(
      <ProfileConfigurationField
        field={createArrayField([
          scalarItemField,
          {
            key: 'tls',
            label: 'TLS',
            type: 'object',
            required: true,
            sensitive: false,
            constraints: {},
            fields: [{ ...scalarItemField, key: 'secret', label: 'Secret' }],
          },
        ])}
        path="listeners"
        value={[{ name: 'https', tls: { secret: 'certificate' } }]}
        violations={[]}
        onChange={jest.fn()}
      />
    )

    expect(screen.getByRole('button', { name: 'Add item to Listeners' })).toBeDisabled()
    expect(screen.getByText('Items with nested settings cannot be added here yet.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit https' })).toBeEnabled()
  })
})

describe('card layout', () => {
  it('adds, edits and removes items while keeping their summaries in sync', async () => {
    function Form() {
      const [value, setValue] = useState<unknown>([])
      return (
        <ProfileConfigurationField
          field={createArrayField([scalarItemField])}
          path="listeners"
          layout="card"
          arrayLabels={{ item: 'Listener', add: 'Add listener', empty: 'No listeners added' }}
          value={value}
          violations={[]}
          onChange={setValue}
        />
      )
    }
    const { userEvent } = renderWithProviders(<Form />)
    expect(screen.getByText('No listeners added')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Add item to Listeners' }))
    await userEvent.type(await screen.findByLabelText('Name'), 'https')
    await userEvent.click(screen.getByRole('button', { name: 'Add', exact: true }))
    expect(await screen.findByText('Name: https')).toBeInTheDocument()
    expect(screen.getByText('Listener 1')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Edit https' }))
    await userEvent.clear(await screen.findByLabelText('Name'))
    await userEvent.type(screen.getByLabelText('Name'), 'http')
    await userEvent.click(screen.getByRole('button', { name: 'Save', exact: true }))
    expect(await screen.findByText('Name: http')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Remove http' }))
    expect(screen.getByText('No listeners added')).toBeInTheDocument()
  })
})
