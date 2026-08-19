import posthog from 'posthog-js'
import { type OrganizationPolicyApiToken } from 'qovery-typescript-axios'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import * as useDeletePolicyApiTokenModule from '../hooks/use-delete-policy-api-token/use-delete-policy-api-token'
import * as usePolicyApiTokensModule from '../hooks/use-policy-api-tokens/use-policy-api-tokens'
import { SettingsPolicyApiToken } from './settings-policy-api-token'

jest.mock('posthog-js', () => ({
  capture: jest.fn(),
}))

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

const usePolicyApiTokensMockSpy = jest.spyOn(usePolicyApiTokensModule, 'usePolicyApiTokens') as jest.Mock
const useDeletePolicyApiTokenMockSpy = jest.spyOn(useDeletePolicyApiTokenModule, 'useDeletePolicyApiToken') as jest.Mock

const deletePolicyApiTokenMock = jest.fn()

describe('SettingsPolicyApiToken', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useDeletePolicyApiTokenMockSpy.mockReturnValue({
      mutateAsync: deletePolicyApiTokenMock,
    })
  })

  it('should render its own page heading, matching the API token page', () => {
    usePolicyApiTokensMockSpy.mockReturnValue({ data: [] })

    renderWithProviders(<SettingsPolicyApiToken />)

    // Its own h1 rather than a sub-heading of the API token page: the two are separate settings
    // pages now, each reached from its own sidebar entry.
    expect(screen.getByRole('heading', { level: 1, name: /Policy API Token \(Beta\)/i })).toBeInTheDocument()
  })

  it('should link to the policy token documentation', () => {
    usePolicyApiTokensMockSpy.mockReturnValue({ data: [] })

    renderWithProviders(<SettingsPolicyApiToken />)

    expect(screen.getByRole('link', { name: /learn more/i })).toHaveAttribute(
      'href',
      'https://www.qovery.com/docs/configuration/organization/api-policy-token'
    )
  })

  it('should render empty state', () => {
    usePolicyApiTokensMockSpy.mockReturnValue({ data: [] })

    renderWithProviders(<SettingsPolicyApiToken />)

    expect(screen.getByText(/No Policy API Token found/i)).toBeInTheDocument()
  })

  it('should open modal when clicking add new', async () => {
    usePolicyApiTokensMockSpy.mockReturnValue({ data: [] })

    const { userEvent } = renderWithProviders(<SettingsPolicyApiToken />)

    await userEvent.click(screen.getByRole('button', { name: /add new policy API token/i }))

    expect(mockOpenModal).toHaveBeenCalled()
  })

  it('should capture the add-new click in posthog', async () => {
    // Lost once already in a refactor, so it is pinned: the event is the only signal of how often
    // the flow is started versus completed ('policy-api-token-created' covers the other end).
    usePolicyApiTokensMockSpy.mockReturnValue({ data: [] })

    const { userEvent } = renderWithProviders(<SettingsPolicyApiToken />)

    await userEvent.click(screen.getByRole('button', { name: /add new policy API token/i }))

    expect(posthog.capture).toHaveBeenCalledWith('policy-api-token-add-clicked', {
      organization_id: 'org-1',
    })
  })

  it('should open confirmation and delete token', async () => {
    const policyApiToken = {
      id: 'policy-token-1',
      name: 'my-agent',
      role_name: 'devops',
      opa_policy: 'default allow := false\n',
      created_at: '2026-08-05T12:00:00Z',
    } as OrganizationPolicyApiToken

    usePolicyApiTokensMockSpy.mockReturnValue({ data: [policyApiToken] })

    const { userEvent } = renderWithProviders(<SettingsPolicyApiToken />)

    expect(screen.getByTestId(`policy-token-list-${policyApiToken.id}`)).toBeInTheDocument()

    await userEvent.click(screen.getByTestId('delete-policy-token'))

    expect(mockOpenModalConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Delete Policy API token',
        confirmationMethod: 'action',
        name: policyApiToken.name,
      })
    )

    const [{ action }] = mockOpenModalConfirmation.mock.calls[0]
    action()

    expect(deletePolicyApiTokenMock).toHaveBeenCalledWith({
      organizationId: 'org-1',
      policyApiTokenId: policyApiToken.id,
    })
  })
})
