import { useQuery } from '@tanstack/react-query'
import { type OrganizationCustomDomainResponse } from 'qovery-typescript-axios'
import { Checkbox as MockCheckbox } from '@qovery/shared/ui'
import { renderWithProviders, screen, waitFor, within } from '@qovery/shared/util-tests'
import { OrganizationDomains, OrganizationDomainsContent } from './organization-domains'

const mockList = jest.fn()
let mockRoles = ['organization:org-1:admin']
let mockSearch: { page?: number; pageSize?: number } = {}
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
// The global test setup stubs `useDebounce`; this one really waits, like the real hook.
jest.mock('@qovery/shared/util-hooks', () => {
  const { useEffect, useState } = jest.requireActual('react')
  return {
    ...jest.requireActual('@qovery/shared/util-hooks'),
    useDebounce: <T,>(value: T, delay: number) => {
      const [debounced, setDebounced] = useState(value)
      useEffect(() => {
        const timeout = setTimeout(() => setDebounced(value), delay)
        return () => clearTimeout(timeout)
      }, [value, delay])
      return debounced
    },
  }
})
const mockRecheck = jest.fn()
let mockDnsStatuses = new Map<string, { status: string; details: string[] }>()
jest.mock('./use-organization-domain-dns-statuses', () => ({
  useOrganizationDomainDnsStatuses: () => ({
    getStatus: ({ environment_id, domain }: OrganizationCustomDomainResponse) =>
      mockDnsStatuses.get(`${environment_id}:${domain}`),
    isChecking: false,
    recheck: mockRecheck,
  }),
}))
jest.mock('@qovery/shared/iam/feature', () => ({
  useUserRole: () => ({ roles: mockRoles, isQoveryAdminUser: mockRoles.includes('admin'), loading: false }),
}))
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
let mockState = { data: result, isLoading: false, isFetching: false, isPreviousData: false, isError: false, refetch }

beforeEach(() => {
  mockList.mockClear()
  mockDnsStatuses = new Map()
  mockSearch = {}
  mockNavigate
    .mockReset()
    .mockImplementation(({ search }: { search: (prev: typeof mockSearch) => typeof mockSearch }) => {
      mockSearch = search(mockSearch)
      mockSearchListeners.forEach((listener) => listener())
    })
  mockRoles = ['organization:org-1:admin']
  mockState = { data: result, isLoading: false, isFetching: false, isPreviousData: false, isError: false, refetch }
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

it('lets Qovery administrators manage any organization domains', () => {
  mockRoles = ['admin']
  renderWithProviders(<OrganizationDomains />)
  expect(screen.queryByText('Administrator access required')).not.toBeInTheDocument()
  expect(mockList).toHaveBeenCalled()
})

it('uses server pagination and resets to the first page when searching', async () => {
  const { userEvent } = renderWithProviders(<OrganizationDomainsContent />)
  await userEvent.click(screen.getByTestId('button-next-page'))
  expect(mockList.mock.lastCall[0]).toEqual(expect.arrayContaining([expect.objectContaining({ page: 2 })]))
  await userEvent.type(screen.getByRole('textbox', { name: 'Search domains' }), 'example')
  await waitFor(() =>
    expect(mockList.mock.lastCall[0]).toEqual(
      expect.arrayContaining([expect.objectContaining({ page: 1, search: 'example' })])
    )
  )
})

it('waits for typing to pause before searching', async () => {
  const { userEvent } = renderWithProviders(<OrganizationDomainsContent />)
  await userEvent.type(screen.getByRole('textbox', { name: 'Search domains' }), 'api.example')
  expect(screen.getByRole('textbox', { name: 'Search domains' })).toHaveValue('api.example')
  const searchedKeys = () =>
    mockList.mock.calls.map(([key]) => (key as [string, string, string, { search?: string }])[3]?.search)
  // No request for the partial values typed before the pause.
  expect(searchedKeys()).not.toContain('a')
  await waitFor(() => expect(searchedKeys()).toContain('api.example'))
  expect(searchedKeys().filter((search) => search && search !== 'api.example')).toEqual([])
})

it('shows skeleton rows instead of the previous results while a search is pending or loading', async () => {
  const { container, userEvent } = renderWithProviders(<OrganizationDomainsContent />)
  const skeletonRows = () => container.querySelectorAll('tbody tr[aria-hidden="true"]')
  expect(skeletonRows()).toHaveLength(0)

  // Waiting for typing to pause.
  await userEvent.type(screen.getByRole('textbox', { name: 'Search domains' }), 'api')
  expect(skeletonRows()).toHaveLength(10)
  expect(screen.queryByText('app.example.com')).not.toBeInTheDocument()

  // The request for the new search is running; the previous results are still kept by the query.
  mockState = { ...mockState, isFetching: true, isPreviousData: true }
  await waitFor(() =>
    expect(mockList.mock.lastCall[0]).toEqual(expect.arrayContaining([expect.objectContaining({ search: 'api' })]))
  )
  expect(skeletonRows()).toHaveLength(10)
})

it('keeps the rows during a background refresh of the same results', () => {
  mockState = { ...mockState, isFetching: true }
  const { container } = renderWithProviders(<OrganizationDomainsContent />)
  expect(container.querySelectorAll('tbody tr[aria-hidden="true"]')).toHaveLength(0)
  expect(screen.getByText('app.example.com')).toBeInTheDocument()
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

it('counts DNS statuses on the page and filters the page by status', async () => {
  mockState = {
    ...mockState,
    data: {
      ...result,
      results: [
        result.results[0],
        { ...result.results[0], domain: 'api.example.com' },
        { ...result.results[0], domain: 'www.example.com' },
      ],
    },
  }
  mockDnsStatuses = new Map([
    ['env:app.example.com', { status: 'valid', details: [] }],
    ['env:api.example.com', { status: 'failing', details: ['Wrong host'] }],
    ['env:www.example.com', { status: 'valid', details: [] }],
  ])
  const { userEvent } = renderWithProviders(<OrganizationDomainsContent />)
  const summary = screen.getByRole('group', { name: 'DNS status on this page' })
  expect(
    within(summary)
      .getAllByRole('button')
      .map((button) => button.textContent)
  ).toEqual(['1 failing', '2 valid'])

  await userEvent.click(within(summary).getByRole('button', { name: '1 failing' }))
  expect(screen.getByText('api.example.com')).toBeInTheDocument()
  expect(screen.queryByText('app.example.com')).not.toBeInTheDocument()
  expect(within(summary).getByRole('button', { name: '1 failing' })).toHaveAttribute('aria-pressed', 'true')
  expect(mockNavigate).not.toHaveBeenCalled()

  await userEvent.click(screen.getByRole('button', { name: 'Clear Status filter' }))
  expect(screen.getByText('app.example.com')).toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', { name: 'Status' }))
  await userEvent.click(screen.getByRole('menuitem', { name: 'Valid' }))
  expect(screen.queryByText('api.example.com')).not.toBeInTheDocument()
  expect(screen.getByText('www.example.com')).toBeInTheDocument()
})

it('reads the page size from the URL and writes it back on the first page', async () => {
  mockSearch = { page: 1, pageSize: 10 }
  const { userEvent } = renderWithProviders(<OrganizationDomainsContent />)
  expect(mockList.mock.lastCall[0]).toEqual(
    expect.arrayContaining([expect.objectContaining({ page: 1, pageSize: 10 })])
  )
  expect(screen.getByTestId('select-page-size')).toHaveValue('10')
  // Paging keeps the page size.
  await userEvent.click(screen.getByTestId('button-next-page'))
  expect(mockSearch).toEqual({ page: 2, pageSize: 10 })
  await userEvent.selectOptions(screen.getByTestId('select-page-size'), '100')
  expect(mockNavigate).toHaveBeenLastCalledWith(expect.objectContaining({ replace: true }))
  expect(mockSearch).toEqual({ page: 1, pageSize: 100 })
  expect(mockList.mock.lastCall[0]).toEqual(
    expect.arrayContaining([expect.objectContaining({ page: 1, pageSize: 100 })])
  )
})
