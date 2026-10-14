import { StrictMode } from 'react'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { type PlatformFieldDescriptor } from '../utils/platform-configuration-utils'
import { ProfileArrayItemModal } from './profile-array-item-modal'

const cidrField = {
  key: 'cidr',
  label: 'CIDR',
  type: 'string',
  required: false,
  sensitive: false,
  constraints: {},
} as PlatformFieldDescriptor

describe('ProfileArrayItemModal', () => {
  it.each([
    ['optional fields', cidrField, {}],
    ['prefilled required fields', { ...cidrField, required: true, defaultValue: '10.0.0.0/8' }, { cidr: '10.0.0.0/8' }],
  ])('lets an item made of %s be added without editing it', async (_, field, submittedValues) => {
    const onSubmit = jest.fn()
    const { userEvent } = renderWithProviders(
      <ProfileArrayItemModal
        title="Trusted CIDRs"
        fields={[field as PlatformFieldDescriptor]}
        values={{}}
        isEdit={false}
        onClose={jest.fn()}
        onSubmit={onSubmit}
      />
    )

    const addButton = screen.getByRole('button', { name: 'Add' })
    await waitFor(() => expect(addButton).toBeEnabled())
    await userEvent.click(addButton)

    expect(onSubmit).toHaveBeenCalledWith(submittedValues)
  })

  it('keeps read-only fields disabled and submits their value unchanged', async () => {
    const onSubmit = jest.fn()
    const { userEvent } = renderWithProviders(
      <ProfileArrayItemModal
        title="Trusted CIDRs"
        fields={[{ ...cidrField, readOnly: true }]}
        values={{ cidr: '10.0.0.0/8' }}
        isEdit
        onClose={jest.fn()}
        onSubmit={onSubmit}
      />
    )

    expect(screen.getByRole('textbox')).toBeDisabled()

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSubmit).toHaveBeenCalledWith({ cidr: '10.0.0.0/8' })
  })

  it('reports being mounted until it unmounts, including under StrictMode', () => {
    const onMountedChange = jest.fn()
    const { unmount } = renderWithProviders(
      <StrictMode>
        <ProfileArrayItemModal
          title="Trusted CIDRs"
          fields={[cidrField]}
          values={{}}
          isEdit={false}
          onClose={jest.fn()}
          onMountedChange={onMountedChange}
          onSubmit={jest.fn()}
        />
      </StrictMode>
    )

    expect(onMountedChange).toHaveBeenLastCalledWith(true)

    unmount()

    expect(onMountedChange).toHaveBeenLastCalledWith(false)
  })
})
