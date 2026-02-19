import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import * as useAvailableRolesModule from '../../hooks/use-available-roles/use-available-roles'
import * as useCreateApiTokenModule from '../../hooks/use-create-api-token/use-create-api-token'
import { CrudModalFeature, type CrudModalFeatureProps } from './crud-modal-feature'

const mockOpenModal = jest.fn()
const mockCloseModal = jest.fn()
const mockEnableAlertClickOutside = jest.fn()

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModal: () => ({
    openModal: mockOpenModal,
    closeModal: mockCloseModal,
    enableAlertClickOutside: mockEnableAlertClickOutside,
  }),
}))

const useCreateApiTokenMockSpy = jest.spyOn(useCreateApiTokenModule, 'useCreateApiToken') as jest.Mock
const useAvailableRolesMockSpy = jest.spyOn(useAvailableRolesModule, 'useAvailableRoles') as jest.Mock

const createApiTokenMock = jest.fn()

let props: CrudModalFeatureProps

describe('CrudModalFeature', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    props = {
      onClose: jest.fn(),
      organizationId: '1',
    }
    useCreateApiTokenMockSpy.mockReturnValue({
      mutateAsync: createApiTokenMock,
    })
    useAvailableRolesMockSpy.mockReturnValue({
      data: [
        {
          id: '0',
          name: 'my-role',
        },
      ],
      isFetched: true,
    })
  })

  it('should render successfully', async () => {
    const { baseElement } = renderWithProviders(<CrudModalFeature {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render submit and call good api endpoint', async () => {
    const { userEvent } = renderWithProviders(<CrudModalFeature {...props} />)

    const inputName = screen.getByRole('textbox', { name: /token name/i })
    const inputDescription = screen.getByRole('textbox', { name: /description/i })

    await userEvent.type(inputName, 'test')
    await userEvent.type(inputDescription, 'description')

    const button = screen.getByTestId('submit-button')
    expect(button).toBeEnabled()

    await userEvent.click(button)

    await waitFor(() => {
      expect(createApiTokenMock).toHaveBeenCalledWith({
        organizationId: props.organizationId,
        apiTokenCreateRequest: {
          name: 'test',
          description: 'description',
          role_id: '0',
        },
      })
    })
  })

  it('should open value modal with token and copy action', async () => {
    createApiTokenMock.mockResolvedValueOnce({ token: 'generated-token' })

    const { userEvent } = renderWithProviders(<CrudModalFeature {...props} />)

    await userEvent.type(screen.getByRole('textbox', { name: /token name/i }), 'test')
    await userEvent.type(screen.getByRole('textbox', { name: /description/i }), 'description')

    await userEvent.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(mockOpenModal).toHaveBeenCalled()
    })

    const [{ content }] = mockOpenModal.mock.calls[0]
    const { getByDisplayValue, getByTestId } = renderWithProviders(content)

    expect(getByDisplayValue('generated-token')).toBeInTheDocument()
    expect(getByTestId('copy-container')).toBeInTheDocument()
  })
})
