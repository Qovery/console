import { useQuery } from '@tanstack/react-query'
import { type OrganizationCustomDomainResponse } from 'qovery-typescript-axios'
import { Checkbox as MockCheckbox } from '@qovery/shared/ui'
import { renderWithProviders, screen, within } from '@qovery/shared/util-tests'
import { OrganizationDomains, OrganizationDomainsContent } from './organization-domains'

const mockList = jest.fn()
let mockRoles = ['organization:org-1:admin']
let mockSearch: { page?: number } = {}
const mockSearchListeners = new Set<() => void>()
const mockNavigate = jest.fn()
jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'org-1' }),
  getRouteApi: () => ({
    useNavigate: () => mockNavigate,
    useSearch: () =>
      jest.requireActual('react').useSyncExternalStore(
        (listener: () => void) => {
          mockSearchListeners.add(listener)
          return () => mockSearchListeners.delete(listener)
        },
        () => mockSearch
      ),
  }),
}))
jest.mock('@tanstack/react-query', () => ({ ...jest.requireActual('@tanstack/react-query'), useQuery: jest.fn() }))
jest.mock('@qovery/shared/iam/feature', () => ({ useUserRole: () => ({ roles: mockRoles, loading: false }) }))
jest.mock('./organization-domain-row', () => ({
  OrganizationDomainRow: ({
    domain,
    selected,
    onSelectionChange,
  }: {
    domain: OrganizationCustomDomainResponse
    selected: boolean
    onSelectionChange: (selected: boolean) => void
  }) => (
    <tr>
      <td>
        <MockCheckbox
          aria-label={`Select ${domain.domain}`}
          checked={selected}
          onCheckedChange={(checked) => onSelectionChange(checked === true)}
        />
        {domain.domain}
      </td>
    </tr>
  ),
}))

const result = {
  results: [
    {
      domain: 'app.example.com',
      environment_id: 'env',
      project: { id: 'project-1', name: 'Project one' },
      routes: [
        {
          id: 'route',
          custom_domain_id: 'custom-domain',
          service: { id: 'service', name: 'web', type: 'APPLICATION' },
        },
      ],
    },
  ],
  total_count: 61,
}
const refetch = jest.fn()
let mockState = { data: result, isLoading: false, isFetching: false, isError: false, refetch }

beforeEach(() => {
  mockList.mockClear()
  mockSearch = {}
  mockNavigate
    .mockReset()
    .mockImplementation(({ search }: { search: (prev: typeof mockSearch) => typeof mockSearch }) => {
      mockSearch = search(mockSearch)
      mockSearchListeners.forEach((listener) => listener())
    })
  mockRoles = ['organization:org-1:admin']
  mockState = { data: result, isLoading: false, isFetching: false, isError: false, refetch }
  jest.mocked(useQuery).mockImplementation((options: unknown) => {
    const key = (options as { queryKey: unknown[] }).queryKey
    if (key[0] === 'customDomains') {
      mockList(key)
      return mockState as ReturnType<typeof useQuery>
    }
    if (key[0] === 'projects')
      return {
        data: [
          { id: 'project-1', name: 'Project one' },
          { id: 'project-2', name: 'Project two' },
          { id: 'long-project', name: 'testprojectauditlogslongprojectname' },
        ],
      } as unknown as ReturnType<typeof useQuery>
    if (key[0] === 'environments')
      return {
        data: [
          { id: 'env-1', name: 'Production' },
          { id: 'long-environment', name: 'production-environment-with-a-long-name' },
        ],
      } as unknown as ReturnType<typeof useQuery>
    return { data: [] } as unknown as ReturnType<typeof useQuery>
  })
})

it('restricts organization domains to administrators', () => {
  mockRoles = []
  renderWithProviders(<OrganizationDomains />)
  expect(screen.getByText('Administrator access required')).toBeInTheDocument()
  expect(mockList).not.toHaveBeenCalled()
})

it('uses server pagination and resets to the first page when searching', async () => {
  const { userEvent } = renderWithProviders(<OrganizationDomainsContent />)
  await userEvent.click(screen.getByTestId('button-next-page'))
  expect(mockList.mock.lastCall[0]).toEqual(expect.arrayContaining([expect.objectContaining({ page: 2 })]))
  await userEvent.type(screen.getByRole('textbox', { name: 'Search domains' }), 'example')
  expect(mockList.mock.lastCall[0]).toEqual(
    expect.arrayContaining([expect.objectContaining({ page: 1, search: 'example' })])
  )
})

it('shows skeleton rows while domains are loading', () => {
  mockState = { ...mockState, data: undefined, isLoading: true, isFetching: true } as unknown as typeof mockState
  const { container } = renderWithProviders(<OrganizationDomainsContent />)
  expect(container.querySelectorAll('tbody tr[aria-hidden="true"]')).toHaveLength(10)
  expect(screen.queryByText('No domains configured. Add a custom domain to a service.')).not.toBeInTheDocument()
})

it('reads the page from the URL and writes it back when paging', async () => {
  mockSearch = { page: 2 }
  const { userEvent } = renderWithProviders(<OrganizationDomainsContent />)
  expect(mockList.mock.lastCall[0]).toEqual(expect.arrayContaining([expect.objectContaining({ page: 2 })]))
  await userEvent.click(screen.getByTestId('button-next-page'))
  expect(mockNavigate).toHaveBeenLastCalledWith(expect.objectContaining({ replace: false }))
  expect(mockSearch).toEqual({ page: 3 })
  await userEvent.click(screen.getByTestId('button-previous-page'))
  expect(mockSearch).toEqual({ page: 2 })
  await userEvent.type(screen.getByRole('textbox', { name: 'Search domains' }), 'e')
  expect(mockNavigate).toHaveBeenLastCalledWith(expect.objectContaining({ replace: true }))
  expect(mockSearch).toEqual({ page: 1 })
})

it('explains an empty page reached through the URL', () => {
  mockSearch = { page: 9 }
  mockState = { ...mockState, data: { results: [], total_count: 61 } }
  renderWithProviders(<OrganizationDomainsContent />)
  expect(screen.getByText('No domains on this page.')).toBeInTheDocument()
})

it('offers retry when listing fails', async () => {
  mockState = { ...mockState, isError: true }
  const { userEvent } = renderWithProviders(<OrganizationDomainsContent />)
  await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
  expect(refetch).toHaveBeenCalled()
})

it('renders the domains list', () => {
  const { baseElement } = renderWithProviders(<OrganizationDomainsContent />)
  expect(screen.getByText('app.example.com')).toBeInTheDocument()
  expect(baseElement).toMatchSnapshot()
})

it('filters from the column headers and clears the environment when changing projects', async () => {
  const { userEvent } = renderWithProviders(<OrganizationDomainsContent />)
  const environmentFilter = screen.getByRole('button', { name: 'Environment' })
  expect(environmentFilter).toBeDisabled()
  const projectFilter = screen.getByRole('button', { name: 'Project' })
  expect(projectFilter.closest('th')).toBeInTheDocument()
  await userEvent.click(projectFilter)
  await userEvent.click(screen.getByRole('menuitem', { name: 'Project one' }))
  await userEvent.click(environmentFilter)
  await userEvent.click(screen.getByRole('menuitem', { name: 'Production' }))
  await userEvent.click(screen.getByTestId('button-next-page'))
  expect(mockList.mock.lastCall[0]).toEqual(
    expect.arrayContaining([expect.objectContaining({ projectId: 'project-1', environmentId: 'env-1', page: 2 })])
  )
  await userEvent.click(screen.getByRole('button', { name: 'Project one' }))
  await userEvent.click(screen.getByRole('menuitem', { name: 'Project two' }))
  expect(mockList.mock.lastCall[0]).toEqual(
    expect.arrayContaining([expect.objectContaining({ projectId: 'project-2', environmentId: undefined, page: 1 })])
  )
  await userEvent.click(screen.getByRole('button', { name: 'Clear Project filter' }))
  expect(mockList.mock.lastCall[0]).toEqual(
    expect.arrayContaining([expect.objectContaining({ projectId: undefined, environmentId: undefined, page: 1 })])
  )
})

it('keeps the header filters available when there are no matching domains', () => {
  mockState = { ...mockState, data: { results: [], total_count: 0 } }
  renderWithProviders(<OrganizationDomainsContent />)
  const table = screen.getByRole('table')
  expect(within(table).getByRole('button', { name: 'Project' })).toBeInTheDocument()
  expect(within(table).getByText(/No domains configured/)).toBeInTheDocument()
})

it('truncates long selected labels while preserving the project and environment identifiers', async () => {
  const { userEvent } = renderWithProviders(<OrganizationDomainsContent />)
  await userEvent.click(screen.getByRole('button', { name: 'Project' }))
  await userEvent.click(screen.getByRole('menuitem', { name: 'testprojectauditlogslongprojectname' }))
  expect(screen.getByRole('button', { name: 'testprojecta…' })).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Environment' }))
  await userEvent.click(screen.getByRole('menuitem', { name: 'production-environment-with-a-long-name' }))
  expect(screen.getByRole('button', { name: 'production-e…' })).toBeInTheDocument()
  expect(mockList.mock.lastCall[0]).toEqual(
    expect.arrayContaining([expect.objectContaining({ projectId: 'long-project', environmentId: 'long-environment' })])
  )
  await userEvent.click(screen.getByRole('button', { name: 'Clear Project filter' }))
  expect(mockList.mock.lastCall[0]).toEqual(
    expect.arrayContaining([expect.objectContaining({ projectId: undefined, environmentId: undefined })])
  )
})

it('selects visible rows, unselects them and clears selection on pagination or search changes', async () => {
  const { userEvent } = renderWithProviders(<OrganizationDomainsContent />)
  await userEvent.click(screen.getByRole('checkbox', { name: 'Select all domains on this page' }))
  expect(screen.getByText('1 selected domain')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Unselect' }))
  expect(screen.queryByRole('region', { name: 'Selected domain actions' })).not.toBeInTheDocument()
  await userEvent.click(screen.getByRole('checkbox', { name: 'Select app.example.com' }))
  await userEvent.click(screen.getByTestId('button-next-page'))
  expect(screen.queryByRole('region', { name: 'Selected domain actions' })).not.toBeInTheDocument()
  await userEvent.click(screen.getByRole('checkbox', { name: 'Select app.example.com' }))
  await userEvent.type(screen.getByRole('textbox', { name: 'Search domains' }), 'example')
  expect(screen.queryByRole('region', { name: 'Selected domain actions' })).not.toBeInTheDocument()
})

it('shows an indeterminate page checkbox for partial selection and selects only visible rows', async () => {
  mockState = {
    ...mockState,
    data: { ...result, results: [result.results[0], { ...result.results[0], domain: 'other.example.com' }] },
  }
  const { userEvent } = renderWithProviders(<OrganizationDomainsContent />)
  await userEvent.click(screen.getByRole('checkbox', { name: 'Select app.example.com' }))
  const selectPage = screen.getByRole('checkbox', { name: 'Select all domains on this page' })
  expect(selectPage).toBePartiallyChecked()
  await userEvent.click(selectPage)
  expect(screen.getByText('2 selected domains')).toBeInTheDocument()
  expect(selectPage).toBeChecked()
  await userEvent.click(selectPage)
  expect(screen.queryByRole('region', { name: 'Selected domain actions' })).not.toBeInTheDocument()
})
