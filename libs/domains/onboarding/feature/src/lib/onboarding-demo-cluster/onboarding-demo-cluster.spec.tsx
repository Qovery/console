import { useNavigate, useParams } from '@tanstack/react-router'
import { type Cluster, ProjectsApi } from 'qovery-typescript-axios'
import { toastError } from '@qovery/shared/ui'
import { useCopyToClipboard, useOS } from '@qovery/shared/util-hooks'
import { renderWithProviders, screen, waitFor } from '@qovery/shared/util-tests'
import { useDemoClusterInstallation } from '../hooks/use-demo-cluster-installation/use-demo-cluster-installation'
import { OnboardingCard } from '../onboarding-card/onboarding-card'
import { readPendingOnboarding, savePendingOnboarding } from '../utils/pending-onboarding'
import { OnboardingDemoCluster } from './onboarding-demo-cluster'

jest.mock('@qovery/shared/ui', () => ({ ...jest.requireActual('@qovery/shared/ui'), toastError: jest.fn() }))
jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: jest.fn(),
  useParams: jest.fn(),
}))
jest.mock('@qovery/shared/auth', () => ({ useAuth: () => ({ user: { sub: 'user-1' } }) }))
jest.mock('@qovery/shared/util-hooks', () => ({
  ...jest.requireActual('@qovery/shared/util-hooks'),
  useOS: jest.fn(),
  useCopyToClipboard: jest.fn(),
}))
jest.mock('../hooks/use-demo-cluster-installation/use-demo-cluster-installation', () => ({
  useDemoClusterInstallation: jest.fn(),
}))

const navigate = jest.fn()
const copy = jest.fn()
let listProjects: jest.SpyInstance
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
function installation(readyCluster?: Cluster, isError = false) {
  jest
    .mocked(useDemoClusterInstallation)
    .mockReturnValue({ readyCluster, isError } as ReturnType<typeof useDemoClusterInstallation>)
}
function renderDemo() {
  return renderWithProviders(
    <OnboardingCard step={3}>
      <OnboardingDemoCluster />
    </OnboardingCard>
  )
}

beforeEach(() => {
  jest.clearAllMocks()
  sessionStorage.clear()
  savePendingOnboarding('user-1', progress)
  navigate.mockResolvedValue(undefined)
  copy.mockResolvedValue(undefined)
  jest.mocked(useNavigate).mockReturnValue(navigate)
  jest.mocked(useParams).mockReturnValue({ organizationId: 'created-org' })
  jest.mocked(useOS).mockReturnValue('macos')
  jest.mocked(useCopyToClipboard).mockReturnValue(['', copy])
  installation()
  listProjects = jest.spyOn(ProjectsApi.prototype, 'listProject').mockResolvedValue({
    data: { results: [{ id: 'created-project' }] },
  } as Awaited<ReturnType<ProjectsApi['listProject']>>)
})
afterEach(() => {
  sessionStorage.clear()
  listProjects.mockRestore()
})

it('shows the third step, Docker Desktop prerequisite and macOS command', () => {
  renderDemo()
  expect(screen.getByRole('progressbar')).toHaveValue(3)
  expect(screen.getByRole('heading', { name: 'Create a demo cluster' })).toBeInTheDocument()
  expect(screen.getByText('Install and open Docker Desktop')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Docker website' })).toHaveAttribute(
    'href',
    'https://www.docker.com/products/docker-desktop/'
  )
  expect(screen.getByRole('code')).toHaveTextContent('brew install Qovery/qovery-cli/qovery-cli && qovery demo up')
  expect(navigate).not.toHaveBeenCalled()
  expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Continue' })).toHaveAccessibleDescription(
    'Continue will be enabled once we detect that your demo cluster is ready.'
  )
})

it.each([
  ['macos', 'brew install Qovery/qovery-cli/qovery-cli && qovery demo up'],
  ['linux', 'curl -s https://get.qovery.com | bash && qovery demo up'],
  ['windows', "wsl bash -c 'curl -s https://get.qovery.com | bash && qovery demo up'"],
] as const)('copies the full installation command for %s', async (os, command) => {
  jest.mocked(useOS).mockReturnValue(os)
  const { userEvent } = renderDemo()
  expect(screen.getByRole('code')).toHaveTextContent(command)
  await userEvent.click(screen.getByRole('button', { name: 'Copy' }))
  expect(copy).toHaveBeenCalledWith(command)
})

it('goes back to the cluster choices and preserves the profile', async () => {
  const { userEvent } = renderDemo()
  await userEvent.click(screen.getByRole('button', { name: 'Back' }))
  expect(navigate).toHaveBeenCalledWith({
    to: '/onboarding/organization/$organizationId/cluster',
    params: { organizationId: 'created-org' },
  })
  expect(readPendingOnboarding('user-1')).toEqual(progress)
})

it('waits for Continue before opening the created project once the demo is deployed', async () => {
  installation({ id: 'demo-id' } as Cluster)
  const { userEvent } = renderDemo()
  expect(screen.getByRole('status')).toHaveTextContent('Your demo cluster is ready.')
  expect(navigate).not.toHaveBeenCalled()
  expect(readPendingOnboarding('user-1')).toEqual(progress)
  await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
  await waitFor(() =>
    expect(navigate).toHaveBeenCalledWith({
      to: '/organization/$organizationId/project/$projectId/overview',
      params: { organizationId: 'created-org', projectId: 'created-project' },
      replace: true,
    })
  )
  await waitFor(() => expect(readPendingOnboarding('user-1')).toEqual(progress))
  expect(navigate).toHaveBeenCalledTimes(1)
})

it('keeps waiting when checking the installation fails', () => {
  installation(undefined, true)
  renderDemo()
  expect(screen.getByText('We couldn’t check your cluster yet. Retrying automatically.')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
  expect(navigate).not.toHaveBeenCalled()
  expect(readPendingOnboarding('user-1')).toEqual(progress)
})

it('falls back to the organization when the saved project belongs to another organization', async () => {
  savePendingOnboarding('user-1', { ...progress, organizationId: 'another-org' })
  installation({ id: 'demo-id' } as Cluster)
  const { userEvent } = renderDemo()
  await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
  expect(navigate).toHaveBeenCalledWith({
    to: '/organization/$organizationId/overview',
    params: { organizationId: 'created-org' },
    replace: true,
  })
  expect(readPendingOnboarding('user-1')?.organizationId).toBe('another-org')
})

it('preserves onboarding data after a failed navigation and allows retrying', async () => {
  const error = new Error('Navigation failed')
  navigate.mockRejectedValueOnce(error)
  installation({ id: 'demo-id' } as Cluster)
  const { userEvent } = renderDemo()
  await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
  await waitFor(() => expect(toastError).toHaveBeenCalledWith(error))
  expect(readPendingOnboarding('user-1')).toEqual(progress)
  await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
  await waitFor(() => expect(readPendingOnboarding('user-1')).toEqual(progress))
  expect(navigate).toHaveBeenCalledTimes(2)
})

it('explains the required Windows terminal and WSL integration', () => {
  jest.mocked(useOS).mockReturnValue('windows')
  renderDemo()
  expect(
    screen.getByText(
      'Before running this in PowerShell, install a WSL 2 Linux distribution (such as Ubuntu) and set it as the default. Enable Docker Desktop’s WSL integration for that distribution in Settings > Resources > WSL Integration.'
    )
  ).toBeInTheDocument()
})

it('falls back to the organization when the saved project was deleted', async () => {
  listProjects.mockResolvedValue({ data: { results: [{ id: 'another-project' }] } })
  installation({ id: 'demo-id' } as Cluster)
  const { userEvent } = renderDemo()
  await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
  await waitFor(() =>
    expect(navigate).toHaveBeenCalledWith({
      to: '/organization/$organizationId/overview',
      params: { organizationId: 'created-org' },
      replace: true,
    })
  )
  expect(listProjects).toHaveBeenCalledWith('created-org')
  expect(readPendingOnboarding('user-1')).toEqual(progress)
})

it('falls back to the organization without fetching projects when no project was saved', async () => {
  savePendingOnboarding('user-1', { ...progress, projectId: undefined })
  installation({ id: 'demo-id' } as Cluster)
  const { userEvent } = renderDemo()
  await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
  expect(navigate).toHaveBeenCalledWith({
    to: '/organization/$organizationId/overview',
    params: { organizationId: 'created-org' },
    replace: true,
  })
  expect(listProjects).not.toHaveBeenCalled()
})

it('keeps the page and recovery record when project lookup fails and allows retrying', async () => {
  const error = new Error('Project check failed')
  listProjects.mockRejectedValueOnce(error)
  installation({ id: 'demo-id' } as Cluster)
  const { userEvent } = renderDemo()
  await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
  await waitFor(() => expect(toastError).toHaveBeenCalledWith(error))
  expect(navigate).not.toHaveBeenCalled()
  expect(readPendingOnboarding('user-1')).toEqual(progress)
  expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
  await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
  await waitFor(() =>
    expect(navigate).toHaveBeenCalledWith({
      to: '/organization/$organizationId/project/$projectId/overview',
      params: { organizationId: 'created-org', projectId: 'created-project' },
      replace: true,
    })
  )
  expect(listProjects).toHaveBeenCalledTimes(2)
  expect(readPendingOnboarding('user-1')).toEqual(progress)
})
