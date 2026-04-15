import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import OnboardingProject from './onboarding-project'

const mockedUsedNavigate = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: () => mockedUsedNavigate,
}))

jest.mock('@elgorditosalsero/react-gtm-hook', () => ({
  useGTMDispatch: () => jest.fn(),
}))

jest.mock('@qovery/shared/auth', () => ({
  ...jest.requireActual('@qovery/shared/auth'),
  useAuth: () => ({
    user: {
      email: 'user@qovery.com',
    },
    getAccessTokenSilently: jest.fn(),
  }),
}))

jest.mock('@qovery/shared/util-hooks', () => ({
  ...jest.requireActual('@qovery/shared/util-hooks'),
  useDocumentTitle: () => undefined,
}))

jest.mock('@qovery/domains/organizations/feature', () => ({
  ...jest.requireActual('@qovery/domains/organizations/feature'),
  useCreateOrganization: () => ({ mutateAsync: jest.fn() }),
  useEditBillingInfo: () => ({ mutateAsync: jest.fn() }),
  useOrganizations: jest.fn(),
}))

jest.mock('@qovery/domains/projects/feature', () => ({
  ...jest.requireActual('@qovery/domains/projects/feature'),
  useCreateProject: () => ({ mutateAsync: jest.fn() }),
}))

jest.mock('@qovery/domains/users-sign-up/feature', () => ({
  ...jest.requireActual('@qovery/domains/users-sign-up/feature'),
  useCreateUserSignUp: () => ({ mutateAsync: jest.fn() }),
  useUserSignUp: jest.fn(),
}))

const { useOrganizations } = jest.requireMock('@qovery/domains/organizations/feature') as {
  useOrganizations: jest.Mock
}
const { useUserSignUp } = jest.requireMock('@qovery/domains/users-sign-up/feature') as {
  useUserSignUp: jest.Mock
}

describe('OnboardingProject', () => {
  beforeEach(() => {
    mockedUsedNavigate.mockClear()
    useOrganizations.mockReturnValue({ data: [] })
    useUserSignUp.mockReturnValue({ data: undefined })
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<OnboardingProject />)
    expect(baseElement).toBeTruthy()
  })

  it('should redirect to the first organization when billing is skipped', async () => {
    useOrganizations.mockReturnValue({
      data: [{ id: 'org-1', name: 'First organization' }],
    })
    useUserSignUp.mockReturnValue({
      data: { dx_auth: true },
    })

    const { userEvent } = renderWithProviders(<OnboardingProject />)

    await userEvent.click(screen.getByRole('button', { name: 'Back' }))

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      to: '/organization/$organizationId/overview',
      params: { organizationId: 'org-1' },
      replace: true,
    })
  })

  it('should hide the back button when billing is skipped without a safe destination', () => {
    useOrganizations.mockReturnValue({ data: [] })
    useUserSignUp.mockReturnValue({
      data: { dx_auth: true },
    })

    renderWithProviders(<OnboardingProject />)

    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument()
  })

  it('should redirect to personalize for the standard onboarding flow', async () => {
    const { userEvent } = renderWithProviders(<OnboardingProject />)

    await userEvent.click(screen.getByRole('button', { name: 'Back' }))

    expect(mockedUsedNavigate).toHaveBeenCalledWith({ to: '/onboarding/personalize' })
  })

  it('should redirect to the previous url when it is provided', async () => {
    useOrganizations.mockReturnValue({
      data: [{ id: 'org-1', name: 'First organization' }],
    })
    useUserSignUp.mockReturnValue({
      data: { dx_auth: true },
    })

    const { userEvent } = renderWithProviders(<OnboardingProject previousUrl="/organization/org-previous/overview" />)

    await userEvent.click(screen.getByRole('button', { name: 'Back' }))

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      href: '/organization/org-previous/overview',
      replace: true,
    })
  })
})
