import { useFeatureFlagEnabled } from 'posthog-js/react'
import { useEnvironment } from '@qovery/domains/environments/feature'
import { render, screen } from '@qovery/shared/util-tests'
import { Route } from '../routes/_authenticated/organization/$organizationId/project/$projectId/environment/$environmentId/automation'

jest.mock('@tanstack/react-router', () => ({
  createFileRoute: () => (options: { component: unknown }) => ({
    options,
    useParams: () => ({ organizationId: 'org', projectId: 'project', environmentId: 'env' }),
  }),
  Navigate: () => <div>Redirect to overview</div>,
}))
jest.mock('posthog-js/react', () => ({ useFeatureFlagEnabled: jest.fn() }))
jest.mock('@qovery/domains/environments/feature', () => ({
  useEnvironment: jest.fn(),
  AgentTaskPreviewEnvironments: () => <div>Previews</div>,
}))
jest.mock('@qovery/domains/services/feature', () => ({
  EnvironmentAutomation: () => <div>Automation content</div>,
  ServiceListSkeleton: () => <div>Loading automation</div>,
}))
jest.mock('@qovery/shared/util-hooks', () => ({ useDocumentTitle: jest.fn() }))

const RouteComponent = Route.options.component as () => React.ReactNode

it('redirects with the flag disabled without loading the environment', () => {
  jest.mocked(useFeatureFlagEnabled).mockReturnValue(false)
  render(<RouteComponent />)
  expect(screen.getByText('Redirect to overview')).toBeInTheDocument()
  expect(useEnvironment).not.toHaveBeenCalled()
})

it('shows the page skeleton while an uncached environment suspends', () => {
  jest.mocked(useFeatureFlagEnabled).mockReturnValue(true)
  jest.mocked(useEnvironment).mockImplementation(() => {
    throw new Promise(() => undefined)
  })
  render(<RouteComponent />)
  expect(screen.getByText('Loading automation')).toBeInTheDocument()
})

it('renders Automation after the environment has loaded', () => {
  jest.mocked(useFeatureFlagEnabled).mockReturnValue(true)
  jest.mocked(useEnvironment).mockReturnValue({ data: { name: 'Environment' } } as ReturnType<typeof useEnvironment>)
  render(<RouteComponent />)
  expect(screen.getByText('Automation content')).toBeInTheDocument()
  expect(screen.queryByText('Loading automation')).not.toBeInTheDocument()
})
