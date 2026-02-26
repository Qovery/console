import { useNavigate } from '@tanstack/react-router'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { useCreateCustomRole } from '../../hooks/use-create-custom-role/use-create-custom-role'
import CreateModal, { type CreateModalProps } from './create-modal'

jest.mock('../../hooks/use-create-custom-role/use-create-custom-role')

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: jest.fn(),
}))

describe('CreateModal', () => {
  const useCreateCustomRoleMock = useCreateCustomRole as jest.MockedFunction<typeof useCreateCustomRole>
  const useNavigateMock = useNavigate as jest.MockedFunction<typeof useNavigate>

  const props: CreateModalProps = {
    onClose: jest.fn(),
    organizationId: '1',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    useCreateCustomRoleMock.mockReturnValue({
      mutateAsync: jest.fn(),
      isLoading: false,
    } as unknown as ReturnType<typeof useCreateCustomRole>)
    useNavigateMock.mockReturnValue(jest.fn())
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<CreateModal {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should submit the form and navigate to edit page', async () => {
    const navigateMock = jest.fn()
    const mutateAsyncMock = jest.fn().mockResolvedValue({ id: 'role-1' })

    useNavigateMock.mockReturnValue(navigateMock)
    useCreateCustomRoleMock.mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isLoading: false,
    } as unknown as ReturnType<typeof useCreateCustomRole>)

    const { userEvent } = renderWithProviders(<CreateModal {...props} />)

    await userEvent.type(screen.getByTestId('input-name'), 'my-role')
    await userEvent.type(screen.getByTestId('input-description'), 'description')

    await userEvent.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith({
        organizationId: '1',
        customRoleUpdateRequest: {
          name: 'my-role',
          description: 'description',
        },
      })
    })

    expect(props.onClose).toHaveBeenCalled()
    expect(navigateMock).toHaveBeenCalledWith({
      to: '/organization/$organizationId/settings/roles/edit/$roleId',
      params: {
        organizationId: '1',
        roleId: 'role-1',
      },
    })
  })
})
