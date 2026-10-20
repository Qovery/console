import { defaultParseSearch } from '@tanstack/react-router'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { type PropsWithChildren } from 'react'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { Route } from './new'

jest.mock('posthog-js/react', () => ({ useFeatureFlagEnabled: jest.fn() }))
jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'org-id' }),
  Link: ({ children }: PropsWithChildren) => <span>{children}</span>,
}))
jest.mock('@qovery/domains/clusters/feature', () => ({
  ClusterAdd: ({ hideDemo }: { hideDemo?: boolean }) => <div>ClusterAdd {hideDemo ? 'without demo' : 'with demo'}</div>,
  ClusterNew: ({ hideDemo }: { hideDemo?: boolean }) => <div>ClusterNew {hideDemo ? 'without demo' : 'with demo'}</div>,
}))
jest.mock('@qovery/shared/util-hooks', () => ({
  ...jest.requireActual('@qovery/shared/util-hooks'),
  useDocumentTitle: jest.fn(),
}))

afterEach(() => jest.restoreAllMocks())

it.each([
  ['?no-demo=true', true],
  ['?no-demo=false', false],
  ['', undefined],
  ['?no-demo=invalid', false],
  ['?no-demo=1', false],
  ['?no-demo=%22true%22', false],
])('validates the router-parsed search %s', (search, hideDemo) => {
  expect(Route.options.validateSearch.parse(defaultParseSearch(search))).toEqual({ 'no-demo': hideDemo })
})

it.each([
  [false, true, 'ClusterNew without demo', 'Install cluster'],
  [true, true, 'ClusterAdd without demo', 'Add cluster'],
  [true, false, 'ClusterAdd with demo', 'Add cluster'],
  [false, false, 'ClusterNew with demo', 'Install cluster'],
])('selects the correct cluster view (Engine V2: %s, onboarding: %s)', (engineV2, hideDemo, view, title) => {
  jest.mocked(useFeatureFlagEnabled).mockReturnValue(engineV2)
  jest
    .spyOn(Route, 'useSearch')
    .mockReturnValue(Route.options.validateSearch.parse(defaultParseSearch(`?no-demo=${hideDemo}`)))
  const Component = Route.options.component
  if (!Component) throw new Error('Cluster route component is missing')
  renderWithProviders(<Component />)
  expect(screen.getByText(view)).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
})
