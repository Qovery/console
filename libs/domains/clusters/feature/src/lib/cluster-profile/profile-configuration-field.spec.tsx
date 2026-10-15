import { type FieldSchemaResponse } from 'qovery-typescript-axios'
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
