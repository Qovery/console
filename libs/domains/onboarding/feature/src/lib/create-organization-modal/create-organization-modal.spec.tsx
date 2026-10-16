import { PlanEnum } from 'qovery-typescript-axios'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { CreateOrganizationModal } from './create-organization-modal'

const mockNavigate = jest.fn()
const mockCreateOrganization = jest.fn()
const mockCreateProject = jest.fn()
const mockRefreshToken = jest.fn()
const setModalDismissible = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: () => mockNavigate,
}))
jest.mock('@qovery/shared/auth', () => ({
  useAuth: () => ({ user: { email: 'jane@example.com' }, getAccessTokenSilently: mockRefreshToken }),
}))
jest.mock('@qovery/domains/organizations/feature', () => ({
  ...jest.requireActual('@qovery/domains/organizations/feature'),
  useCreateOrganization: () => ({ mutateAsync: mockCreateOrganization }),
}))
jest.mock('@qovery/domains/projects/feature', () => ({
  ...jest.requireActual('@qovery/domains/projects/feature'),
  useCreateProject: () => ({ mutateAsync: mockCreateProject }),
}))
jest.mock('@qovery/domains/users-sign-up/feature', () => ({
  useUserSignUp: () => ({ data: { first_name: 'Jane', last_name: 'Doe', company_name: 'Acme' } }),
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

  it('asks only for the organization name and automatically creates main', async () => {
    const onClose = jest.fn()
    const { userEvent } = renderWithProviders(
      <CreateOrganizationModal onClose={onClose} setModalDismissible={setModalDismissible} />
    )
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
    expect(setModalDismissible).toHaveBeenNthCalledWith(1, false)
    expect(setModalDismissible).toHaveBeenLastCalledWith(true)
    expect(window.dataLayer).toEqual([{ event: 'onboarding-organization-created', plan: PlanEnum.BUSINESS_2025 }])
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

  it('retries navigation without recreating main', async () => {
    mockNavigate.mockRejectedValueOnce(new Error('Navigation failed'))
    const onClose = jest.fn()
    const { userEvent } = renderWithProviders(<CreateOrganizationModal onClose={onClose} />)
    await userEvent.type(screen.getByLabelText('Organization name'), 'Acme')
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))
    await screen.findByRole('alert')
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
    expect(mockCreateOrganization).toHaveBeenCalledTimes(1)
    expect(mockCreateProject).toHaveBeenCalledTimes(1)
    expect(window.dataLayer).toHaveLength(1)
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
