import { useNavigate, useParams } from '@tanstack/react-router'
import posthog from 'posthog-js'
import { type ComponentPropsWithoutRef, useContext as mockUseContext } from 'react'
import { DevopsCopilotContext as mockCopilotContext } from '@qovery/shared/devops-copilot/context'
import { ModalProvider } from '@qovery/shared/ui'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { OnboardingCard } from '../onboarding-card/onboarding-card'
import { OnboardingCopilot } from '../onboarding-copilot/onboarding-copilot'
import { readPendingOnboarding, savePendingOnboarding } from '../utils/pending-onboarding'
import { OnboardingCluster } from './onboarding-cluster'

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: jest.fn(),
  useParams: jest.fn(),
  Link: ({
    to,
    params,
    onClick,
    children,
    ...props
  }: ComponentPropsWithoutRef<'a'> & { to: string; params: { organizationId: string } }) => (
    <a
      {...props}
      href={to.replace('$organizationId', params.organizationId)}
      onClick={(event) => {
        event.preventDefault()
        onClick?.(event)
      }}
    >
      {children}
    </a>
  ),
}))
jest.mock('@qovery/shared/auth', () => ({ useAuth: () => ({ user: { sub: 'user-1' } }) }))
jest.mock('@qovery/shared/devops-copilot/feature', () => ({
  DevopsCopilotTrigger: function MockCopilot() {
    const { devopsCopilotOpen, setDevopsCopilotOpen } = mockUseContext(mockCopilotContext)
    if (!devopsCopilotOpen) return null
    return (
      <div role="dialog" aria-label="Copilot">
        <button onClick={() => setDevopsCopilotOpen(false)}>Close Copilot</button>
      </div>
    )
  },
}))
jest.mock('posthog-js', () => ({ capture: jest.fn() }))
const navigate = jest.fn()
const progress = {
  organizationId: 'created-org',
  projectId: 'created-project',
  completionTracked: true,
  profile: {
    full_name: 'John Doe',
    user_email: 'john@acme.com',
    company_name: 'Acme',
    organization_name: 'Acme',
    phone: '',
  },
}
function renderCluster() {
  return renderWithProviders(
    <ModalProvider>
      <OnboardingCard step={2}>
        <OnboardingCluster />
      </OnboardingCard>
      <OnboardingCopilot />
    </ModalProvider>
  )
}

describe('OnboardingCluster', () => {
  beforeEach(() => {
    sessionStorage.clear()
    jest.clearAllMocks()
    navigate.mockResolvedValue(undefined)
    jest.mocked(useParams).mockReturnValue({ organizationId: 'created-org' })
    jest.mocked(useNavigate).mockReturnValue(navigate)
    savePendingOnboarding('user-1', progress)
  })
  afterEach(() => sessionStorage.clear())

  it('shows step two and opens the existing cloud cluster flow', async () => {
    const { userEvent } = renderCluster()
    expect(screen.getByRole('progressbar')).toHaveValue(2)
    await userEvent.click(screen.getByRole('button', { name: /I have a cloud admin account/ }))
    expect(navigate).toHaveBeenCalledWith({
      to: '/organization/$organizationId/cluster/new',
      params: { organizationId: 'created-org' },
      search: { 'no-demo': true },
    })
    expect(posthog.capture).toHaveBeenCalledTimes(1)
    expect(posthog.capture).toHaveBeenCalledWith('onboarding-cloud-admin-selected', {
      has_cloud_admin_access: true,
      option: 'cloud-admin',
      organization_id: 'created-org',
      $groups: { organization_id: 'created-org' },
    })
    expect(readPendingOnboarding('user-1')).toEqual(progress)
  })
  it('opens the demo installation step without discarding profile progress', async () => {
    const { userEvent } = renderCluster()
    await userEvent.click(screen.getByRole('button', { name: /I don’t have a cloud admin account/ }))
    expect(navigate).toHaveBeenCalledWith({
      to: '/onboarding/organization/$organizationId/demo-cluster',
      params: { organizationId: 'created-org' },
    })
    expect(posthog.capture).toHaveBeenCalledTimes(1)
    expect(posthog.capture).toHaveBeenCalledWith('onboarding-demo-selected', {
      has_cloud_admin_access: false,
      option: 'local-demo',
      organization_id: 'created-org',
      $groups: { organization_id: 'created-org' },
    })
    expect(readPendingOnboarding('user-1')).toEqual(progress)
  })
  it('does not show the redundant explore link', () => {
    renderCluster()
    expect(screen.queryByText('I’ll explore the platform by myself')).not.toBeInTheDocument()
  })
  it('goes back to the saved profile without discarding created resources', async () => {
    const { userEvent } = renderCluster()
    await userEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(navigate).toHaveBeenCalledWith({ to: '/onboarding/profile' })
    expect(readPendingOnboarding('user-1')).toEqual(progress)
  })
  it('returns to the overview when there is no matching profile to resume', async () => {
    jest.mocked(useParams).mockReturnValue({ organizationId: 'other-org' })
    const { userEvent } = renderCluster()
    await userEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(navigate).toHaveBeenCalledWith({
      to: '/organization/$organizationId/overview',
      params: { organizationId: 'other-org' },
    })
    expect(readPendingOnboarding('user-1')).toEqual(progress)
  })
  it('opens and closes the usual Copilot through its provider', async () => {
    const { userEvent } = renderCluster()
    expect(screen.queryByRole('dialog', { name: 'Copilot' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Need help? Ask Qopilot' }))
    expect(screen.getByRole('dialog', { name: 'Copilot' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Close Copilot' }))
    expect(screen.queryByRole('dialog', { name: 'Copilot' })).not.toBeInTheDocument()
  })
})
