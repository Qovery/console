import { type OrganizationApiToken } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useApiTokensModule from '../hooks/use-api-tokens/use-api-tokens'
import * as useDeleteApiTokenModule from '../hooks/use-delete-api-token/use-delete-api-token'
import { SettingsApiToken } from './settings-api-token'

const mockOpenModal = jest.fn()
const mockOpenModalConfirmation = jest.fn()
const mockCloseModal = jest.fn()

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModal: () => ({
    openModal: mockOpenModal,
    closeModal: mockCloseModal,
  }),
  useModalConfirmation: () => ({
    openModalConfirmation: mockOpenModalConfirmation,
  }),
}))

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'org-1' }),
}))

const useApiTokensMockSpy = jest.spyOn(useApiTokensModule, 'useApiTokens') as jest.Mock
const useDeleteApiTokenMockSpy = jest.spyOn(useDeleteApiTokenModule, 'useDeleteApiToken') as jest.Mock

const deleteApiTokenMock = jest.fn()

describe('SettingsApiToken', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useDeleteApiTokenMockSpy.mockReturnValue({
      mutateAsync: deleteApiTokenMock,
    })
  })

  it('should render empty state', () => {
    useApiTokensMockSpy.mockReturnValue({ data: [] })

    renderWithProviders(<SettingsApiToken />)

    expect(screen.getByText(/No Api Token found/i)).toBeInTheDocument()
  })

  it('should open modal when clicking add new', async () => {
    useApiTokensMockSpy.mockReturnValue({ data: [] })

    const { userEvent } = renderWithProviders(<SettingsApiToken />)

    const addButton = screen.getByRole('button', { name: /add new/i })
    await userEvent.click(addButton)

    expect(mockOpenModal).toHaveBeenCalled()
  })

  it('should open confirmation and delete token', async () => {
    const apiToken = {
      id: 'token-1',
      name: 'My token',
      role_name: 'admin',
      created_at: '2024-01-01T00:00:00Z',
    } as OrganizationApiToken

    useApiTokensMockSpy.mockReturnValue({ data: [apiToken] })

    const { userEvent } = renderWithProviders(<SettingsApiToken />)

    expect(screen.getByTestId(`token-list-${apiToken.id}`)).toBeInTheDocument()

    const deleteButton = screen.getByTestId('delete-token')
    await userEvent.click(deleteButton)

    expect(mockOpenModalConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Delete API token',
        confirmationMethod: 'action',
        name: apiToken.name,
      })
    )

    const [{ action }] = mockOpenModalConfirmation.mock.calls[0]
    action()

    expect(deleteApiTokenMock).toHaveBeenCalledWith({
      organizationId: 'org-1',
      apiTokenId: apiToken.id,
    })
  })
})
