import posthog from 'posthog-js'
import { PlanEnum } from 'qovery-typescript-axios'
import { toast, toastError, useModal } from '@qovery/shared/ui'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { CreateOrganizationModal } from './create-organization-modal'

jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  toast: jest.fn(),
  toastError: jest.fn(),
}))

jest.mock('posthog-js', () => ({ capture: jest.fn() }))

const mockNavigate = jest.fn()
const mockCreateOrganization = jest.fn()
const mockCreateProject = jest.fn()
const mockRefreshToken = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: () => mockNavigate,
}))
jest.mock('@qovery/shared/auth', () => ({
  useAuth: () => ({ user: { email: 'jane@example.com' }, getAccessTokenSilently: mockRefreshToken }),
}))
jest.mock('../hooks/use-create-organization/use-create-organization', () => ({
  useCreateOrganization: () => ({ mutateAsync: mockCreateOrganization }),
}))
jest.mock('@qovery/domains/projects/feature', () => ({
  ...jest.requireActual('@qovery/domains/projects/feature'),
  useCreateProject: () => ({ mutateAsync: mockCreateProject }),
}))

describe('CreateOrganizationModal', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
    delete window.dataLayer
    mockCreateOrganization.mockResolvedValue({ id: 'new-org' })
    mockCreateProject.mockResolvedValue({ id: 'main-project' })
    mockRefreshToken.mockResolvedValue(undefined)
    mockNavigate.mockResolvedValue(undefined)
  })
  afterEach(() => jest.useRealTimers())

  it('closes the actual modal and shows success while destination navigation is still pending', async () => {
    let finishNavigation: () => void = () => undefined
    mockNavigate.mockReturnValue(
      new Promise<void>((resolve) => {
        finishNavigation = resolve
      })
    )
    const onCreated = jest.fn()
    function OrganizationMenu() {
      const { openModal, closeModal } = useModal()
      return (
        <button
          onClick={() =>
            openModal({
              content: <CreateOrganizationModal onClose={closeModal} onCreated={onCreated} />,
              options: { keepCloseButtonVisible: true },
            })
          }
        >
          New organization
        </button>
      )
    }
    const { userEvent } = renderWithProviders(<OrganizationMenu />)
    await userEvent.click(screen.getByRole('button', { name: 'New organization' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText('Organization name'), 'Acme')
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => expect(mockNavigate).toHaveBeenCalled())
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(onCreated).toHaveBeenCalledTimes(1)
    expect(toast).toHaveBeenCalledWith('success', 'Your organization and project have been created')
    finishNavigation()
  })

  it('keeps the close icon visible but disables dismissal while creation is pending', async () => {
    mockCreateOrganization.mockReturnValue(new Promise(() => undefined))
    function OrganizationMenu() {
      const { openModal, closeModal } = useModal()
      return (
        <button
          onClick={() =>
            openModal({
              content: <CreateOrganizationModal onClose={closeModal} />,
              options: { keepCloseButtonVisible: true },
            })
          }
        >
          New organization
        </button>
      )
    }
    const { userEvent } = renderWithProviders(<OrganizationMenu />)
    await userEvent.click(screen.getByRole('button', { name: 'New organization' }))
    await userEvent.type(screen.getByLabelText('Organization name'), 'Acme')
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))
    await waitFor(() => expect(mockCreateOrganization).toHaveBeenCalled())
    const closeButton = screen.getByRole('button', { name: 'Close', exact: true })
    expect(closeButton).toBeVisible()
    await waitFor(() => expect(closeButton).toBeDisabled())
    await userEvent.click(closeButton)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(mockCreateOrganization).toHaveBeenCalledTimes(1)
  })

  it('asks only for the organization name and automatically creates main', async () => {
    const onClose = jest.fn()
    const { userEvent } = renderWithProviders(<CreateOrganizationModal onClose={onClose} />)
    expect(screen.getAllByRole('textbox')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled()
    await userEvent.type(screen.getByLabelText('Organization name'), ' Acme ')
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
    expect(mockCreateOrganization).toHaveBeenCalledWith({
      organizationRequest: { name: 'Acme', plan: PlanEnum.BUSINESS_2025, admin_emails: ['jane@example.com'] },
    })
    expect(mockRefreshToken).toHaveBeenCalledWith({ cacheMode: 'off' })
    expect(mockCreateProject).toHaveBeenCalledWith({ organizationId: 'new-org', projectRequest: { name: 'main' } })
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/organization/$organizationId/overview',
      params: { organizationId: 'new-org' },
    })
    expect(window.dataLayer).toBeUndefined()
    expect(posthog.capture).not.toHaveBeenCalled()
  })

  it('rejects a blank organization name', async () => {
    const { userEvent } = renderWithProviders(<CreateOrganizationModal onClose={jest.fn()} />)
    await userEvent.type(screen.getByLabelText('Organization name'), '   ')
    expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled()
    expect(mockCreateOrganization).not.toHaveBeenCalled()
  })

  it('cancels without creating resources', async () => {
    const onClose = jest.fn()
    const { userEvent } = renderWithProviders(<CreateOrganizationModal onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(mockCreateOrganization).not.toHaveBeenCalled()
  })

  it.each(['token', 'project'])('retries a failed %s step without creating a duplicate organization', async (step) => {
    if (step === 'token') mockRefreshToken.mockRejectedValueOnce(new Error('Token refresh failed'))
    else mockCreateProject.mockRejectedValueOnce(new Error('Project creation failed'))
    const onClose = jest.fn()
    const { userEvent } = renderWithProviders(<CreateOrganizationModal onClose={onClose} />)
    await userEvent.type(screen.getByLabelText('Organization name'), 'Acme')
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))
    await screen.findByRole('alert')
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Organization name')).toHaveAttribute('readonly')
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
    expect(mockCreateOrganization).toHaveBeenCalledTimes(1)
    expect(mockCreateProject).toHaveBeenLastCalledWith({ organizationId: 'new-org', projectRequest: { name: 'main' } })
  })

  it('reports a navigation failure after closing the successfully completed creation', async () => {
    const navigationError = new Error('Navigation failed')
    mockNavigate.mockRejectedValueOnce(navigationError)
    const onClose = jest.fn()
    const { userEvent } = renderWithProviders(<CreateOrganizationModal onClose={onClose} />)
    await userEvent.type(screen.getByLabelText('Organization name'), 'Acme')
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))
    await waitFor(() => expect(toastError).toHaveBeenCalledWith(navigationError))
    expect(onClose).toHaveBeenCalledTimes(2)
    expect(toast).toHaveBeenCalledWith('success', 'Your organization and project have been created')
    expect(mockCreateOrganization).toHaveBeenCalledTimes(1)
    expect(mockCreateProject).toHaveBeenCalledTimes(1)
    expect(window.dataLayer).toBeUndefined()
    expect(posthog.capture).not.toHaveBeenCalled()
  })

  it('keeps the modal open and allows retry when organization creation fails', async () => {
    mockCreateOrganization.mockRejectedValueOnce(new Error('Creation failed'))
    const onClose = jest.fn()
    const { userEvent } = renderWithProviders(<CreateOrganizationModal onClose={onClose} />)
    await userEvent.type(screen.getByLabelText('Organization name'), 'Acme')
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))
    await screen.findByRole('alert')
    expect(mockCreateProject).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Organization name')).not.toHaveAttribute('readonly')
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
    expect(mockCreateOrganization).toHaveBeenCalledTimes(2)
  })
})
