import { type ReactNode } from 'react'
import { availableRolesMock } from '@qovery/shared/factories'
import { useModal, useModalConfirmation } from '@qovery/shared/ui'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { useAvailableRoles } from '../hooks/use-available-roles/use-available-roles'
import { useDeleteCustomRole } from '../hooks/use-delete-custom-role/use-delete-custom-role'
import { SettingsRoles } from './settings-roles'

jest.mock('../hooks/use-available-roles/use-available-roles')
jest.mock('../hooks/use-delete-custom-role/use-delete-custom-role')

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  useModal: jest.fn(),
  useModalConfirmation: jest.fn(),
}))

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'org-1' }),
  Link: ({ children, ...props }: { children: ReactNode }) => <a {...props}>{children}</a>,
}))

describe('SettingsRoles', () => {
  const useAvailableRolesMock = useAvailableRoles as jest.MockedFunction<typeof useAvailableRoles>
  const useDeleteCustomRoleMock = useDeleteCustomRole as jest.MockedFunction<typeof useDeleteCustomRole>
  const useModalMock = useModal as jest.MockedFunction<typeof useModal>
  const useModalConfirmationMock = useModalConfirmation as jest.MockedFunction<typeof useModalConfirmation>

  const openModalMock = jest.fn()
  const closeModalMock = jest.fn()
  const openModalConfirmationMock = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    useDeleteCustomRoleMock.mockReturnValue({
      mutateAsync: jest.fn(),
    } as unknown as ReturnType<typeof useDeleteCustomRole>)

    useModalMock.mockReturnValue({
      openModal: openModalMock,
      closeModal: closeModalMock,
    })

    useModalConfirmationMock.mockReturnValue({
      openModalConfirmation: openModalConfirmationMock,
    })
  })

  it('should render default and custom roles in order', () => {
    const defaultRole = { ...availableRolesMock[0], id: 'default' }
    const customRole = { id: 'custom', name: 'Platform operator' }

    useAvailableRolesMock.mockReturnValue({
      data: [customRole, defaultRole],
    } as unknown as ReturnType<typeof useAvailableRoles>)

    const { container } = renderWithProviders(<SettingsRoles />)

    expect(screen.getByTestId(`role-${defaultRole.id}`)).toHaveTextContent('AdminBasic Role')
    expect(screen.getByTestId(`role-${customRole.id}`)).toHaveTextContent('Platform operatorCustom Role')
    expect(screen.getByTestId(`role-doc-${defaultRole.id}`)).toBeInTheDocument()
    expect(screen.getByTestId(`role-actions-${customRole.id}`)).toBeInTheDocument()

    const roleItems = Array.from(container.querySelectorAll('[data-testid^="role-"]')).filter((element) => {
      const testId = element.getAttribute('data-testid') ?? ''
      return testId.startsWith('role-') && !testId.startsWith('role-actions-') && !testId.startsWith('role-doc-')
    })

    expect(roleItems.map((element) => element.getAttribute('data-testid'))).toEqual([
      `role-${defaultRole.id}`,
      `role-${customRole.id}`,
    ])
  })

  it('should open the create modal when adding a role', async () => {
    useAvailableRolesMock.mockReturnValue({
      data: [],
    } as unknown as ReturnType<typeof useAvailableRoles>)

    const { userEvent } = renderWithProviders(<SettingsRoles />)

    await userEvent.click(screen.getByRole('button', { name: 'Add new role' }))

    expect(openModalMock).toHaveBeenCalledTimes(1)
    const [payload] = openModalMock.mock.calls[0]
    expect(payload.content).toBeTruthy()
    expect(payload.content.props.organizationId).toBe('org-1')
  })
})
