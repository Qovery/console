import { type ReactNode } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import StepConfirm from './step-confirm'

const mockedUsedNavigate = jest.fn()
const mockedAuthLogout = jest.fn()

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: () => mockedUsedNavigate,
}))

jest.mock('@auth0/auth0-react', () => ({
  ...jest.requireActual('@auth0/auth0-react'),
  Auth0Provider: ({ children }: { children: ReactNode }) => children,
  useAuth0: () => ({
    user: { sub: 'google-oauth2|123', email: 'jdan@qovery.com' },
  }),
}))

jest.mock('@qovery/shared/auth', () => ({
  ...jest.requireActual('@qovery/shared/auth'),
  useAuth: () => ({ authLogout: mockedAuthLogout }),
}))

jest.mock('@qovery/domains/users-sign-up/feature', () => ({
  ...jest.requireActual('@qovery/domains/users-sign-up/feature'),
  useUserSignUp: () => ({ data: undefined }),
}))

jest.mock('@qovery/shared/util-hooks', () => ({
  ...jest.requireActual('@qovery/shared/util-hooks'),
  useLocalStorage: jest.fn(),
}))

const { useLocalStorage } = jest.requireMock('@qovery/shared/util-hooks') as { useLocalStorage: jest.Mock }

describe('StepConfirm', () => {
  beforeEach(() => {
    mockedUsedNavigate.mockClear()
    mockedAuthLogout.mockClear()
    useLocalStorage.mockReturnValue([undefined, jest.fn()])
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<StepConfirm />)
    expect(baseElement).toBeTruthy()
  })

  it('should show the provider and email just used to sign in', () => {
    renderWithProviders(<StepConfirm />)

    expect(screen.getByText('Signed in with Google')).toBeInTheDocument()
    expect(screen.getByText('jdan@qovery.com')).toBeInTheDocument()
  })

  it('should not show the previous provider hint when there is none', () => {
    renderWithProviders(<StepConfirm />)

    expect(screen.queryByText(/Last time on this browser/)).not.toBeInTheDocument()
  })

  it('should show the previous provider hint when it differs from the current one', () => {
    useLocalStorage.mockReturnValue(['github', jest.fn()])

    renderWithProviders(<StepConfirm />)

    expect(screen.getByText('Last time on this browser, you signed in with GitHub.')).toBeInTheDocument()
  })

  it('should navigate into the onboarding funnel when continuing', async () => {
    const { userEvent } = renderWithProviders(<StepConfirm />)

    await userEvent.click(screen.getByRole('button', { name: 'Create my organization' }))

    expect(mockedUsedNavigate).toHaveBeenCalledWith({ href: '/onboarding/personalize' })
  })

  it('should log the user out when switching account', async () => {
    const { userEvent } = renderWithProviders(<StepConfirm />)

    await userEvent.click(screen.getByRole('button', { name: 'Switch account' }))

    expect(mockedAuthLogout).toHaveBeenCalled()
  })
})
