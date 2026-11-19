import { useQuery } from '@tanstack/react-query'
import { type OrganizationCustomDomainResponse } from 'qovery-typescript-axios'
import { renderWithProviders, screen, within } from '@qovery/shared/util-tests'
import { OrganizationDomains, OrganizationDomainsContent } from './organization-domains'

const mockList = jest.fn()
let mockRoles = ['organization:org-1:admin']
jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'org-1' }),
}))
jest.mock('@tanstack/react-query', () => ({ ...jest.requireActual('@tanstack/react-query'), useQuery: jest.fn() }))
jest.mock('@qovery/shared/iam/feature', () => ({ useUserRole: () => ({ roles: mockRoles, loading: false }) }))
jest.mock('./organization-domain-row', () => ({
  OrganizationDomainRow: ({ domain }: { domain: OrganizationCustomDomainResponse }) => (
    <tr>
      <td>{domain.domain}</td>
    </tr>
  ),
}))

const result = { results: [{ domain: 'app.example.com', environment_id: 'env' }], total_count: 61 }
const refetch = jest.fn()
let mockState = { data: result, isLoading: false, isFetching: false, isError: false, refetch }

beforeEach(() => {
  mockList.mockClear()
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
        ],
      } as unknown as ReturnType<typeof useQuery>
    if (key[0] === 'environments')
      return { data: [{ id: 'env-1', name: 'Production' }] } as unknown as ReturnType<typeof useQuery>
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
  const environmentFilter = screen.getByRole('button', { name: 'Filter by environment' })
  expect(environmentFilter).toBeDisabled()
  const projectFilter = screen.getByRole('button', { name: 'Filter by project' })
  expect(projectFilter.closest('th')).toBeInTheDocument()
  await userEvent.click(projectFilter)
  await userEvent.click(screen.getByRole('menuitem', { name: 'Project one' }))
  await userEvent.click(environmentFilter)
  await userEvent.click(screen.getByRole('menuitem', { name: 'Production' }))
  await userEvent.click(screen.getByTestId('button-next-page'))
  expect(mockList.mock.lastCall[0]).toEqual(
    expect.arrayContaining([expect.objectContaining({ projectId: 'project-1', environmentId: 'env-1', page: 2 })])
  )
  await userEvent.click(screen.getByRole('button', { name: 'Filter by project: Project one' }))
  await userEvent.click(screen.getByRole('menuitem', { name: 'Project two' }))
  expect(mockList.mock.lastCall[0]).toEqual(
    expect.arrayContaining([expect.objectContaining({ projectId: 'project-2', environmentId: undefined, page: 1 })])
  )
  await userEvent.click(screen.getByRole('button', { name: 'Filter by project: Project two' }))
  await userEvent.click(screen.getByRole('menuitem', { name: 'All projects' }))
  expect(mockList.mock.lastCall[0]).toEqual(
    expect.arrayContaining([expect.objectContaining({ projectId: undefined, environmentId: undefined, page: 1 })])
  )
})

it('keeps the header filters available when there are no matching domains', () => {
  mockState = { ...mockState, data: { results: [], total_count: 0 } }
  renderWithProviders(<OrganizationDomainsContent />)
  const table = screen.getByRole('table')
  expect(within(table).getByRole('button', { name: 'Filter by project' })).toBeInTheDocument()
  expect(within(table).getByText(/No domains configured/)).toBeInTheDocument()
})
