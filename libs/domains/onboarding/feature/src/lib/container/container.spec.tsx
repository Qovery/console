import { type ComponentPropsWithoutRef, useContext, useState } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import Container, { ContextOnboarding, OnboardingProvider } from './container'

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useLocation: () => ({ pathname: '/onboarding/personalize' }),
  Link: ({ to, children, ...props }: ComponentPropsWithoutRef<'a'> & { to: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}))

function ProfileStep() {
  const { setContextValue } = useContext(ContextOnboarding)
  return (
    <button onClick={() => setContextValue?.({ organization_name: 'Acme', phone: '+33123456789' })}>
      Save profile
    </button>
  )
}

function ProjectStep() {
  const { organization_name, phone } = useContext(ContextOnboarding)
  return (
    <p>
      {organization_name} {phone}
    </p>
  )
}

describe('Container', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())
  it('keeps the existing funnel for subsequent steps', () => {
    renderWithProviders(
      <Container>
        <p>Step content</p>
      </Container>
    )

    expect(screen.getByTestId('progress-bar-wrapper')).toBeInTheDocument()
    expect(screen.getByText('Step content')).toBeInTheDocument()
  })

  it('renders the profile shell with the account menu and no funnel header', () => {
    renderWithProviders(
      <Container profileUserMenu={<button>User menu</button>}>
        <p>Profile form</p>
      </Container>
    )

    expect(screen.getByAltText('Qovery')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Qovery home' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('button', { name: 'User menu' })).toBeInTheDocument()
    expect(screen.queryByTestId('progress-bar-wrapper')).not.toBeInTheDocument()
  })

  it('retains organization and phone when steps unmount inside the onboarding layout', async () => {
    function Workflow() {
      const [step, setStep] = useState(1)
      return (
        <OnboardingProvider>
          {step === 1 ? <ProfileStep /> : <ProjectStep />}
          <button onClick={() => setStep(2)}>Next step</button>
        </OnboardingProvider>
      )
    }
    const { userEvent } = renderWithProviders(<Workflow />)
    await userEvent.click(screen.getByRole('button', { name: 'Save profile' }))
    await userEvent.click(screen.getByRole('button', { name: 'Next step' }))

    expect(screen.getByText('Acme +33123456789')).toBeInTheDocument()
  })
})
