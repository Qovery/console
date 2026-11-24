import { type OrganizationCustomDomainResponse } from 'qovery-typescript-axios'
import { act, renderWithProviders, screen } from '@qovery/shared/util-tests'
import { OrganizationDomainStatusCell, OrganizationDomainStatusSummary } from './organization-domain-status'

let mockPending: Promise<void> | undefined
let mockStatuses = new Map<string, { status: string; details: string[] }>()
let mockFetchingKeys = new Set<string>()
jest.mock('./use-organization-domain-dns-statuses', () => ({
  useOrganizationDomainDnsStatuses: () => {
    if (mockPending) throw mockPending
    return { statuses: mockStatuses, fetchingKeys: mockFetchingKeys, recheck: jest.fn() }
  },
}))

const domain = (name: string): OrganizationCustomDomainResponse => ({
  domain: name,
  environment_id: 'env',
  project: { id: 'project', name: 'project' },
  environment: { id: 'env', name: 'production', routing_mode: 'PER_HOSTNAME_LISTENER_SET' },
  generate_certificate: true,
  use_cdn: false,
  routes: [],
})

beforeEach(() => {
  mockPending = undefined
  mockStatuses = new Map()
  mockFetchingKeys = new Set()
})

it('shows a skeleton until the status settles, then the final badge only', async () => {
  let resolve = () => undefined as void
  mockPending = new Promise<void>((done) => (resolve = done))
  const { container } = renderWithProviders(<OrganizationDomainStatusCell domain={domain('app.example.com')} />)
  expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument()
  expect(screen.queryByText('Unknown')).not.toBeInTheDocument()

  mockStatuses = new Map([['env:app.example.com', { status: 'valid', details: [] }]])
  mockPending = undefined
  await act(async () => resolve())
  expect(await screen.findByText('Valid')).toBeInTheDocument()
  expect(container.querySelector('[aria-busy="true"]')).not.toBeInTheDocument()
})

it('shows a skeleton while the status is rechecked', () => {
  mockStatuses = new Map([['env:app.example.com', { status: 'failing', details: ['Wrong host'] }]])
  mockFetchingKeys = new Set(['env:app.example.com'])
  const { container } = renderWithProviders(<OrganizationDomainStatusCell domain={domain('app.example.com')} />)
  expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument()
  expect(screen.queryByText('Failing')).not.toBeInTheDocument()
})

it('keeps the summary as a skeleton until every status settles', async () => {
  let resolve = () => undefined as void
  mockPending = new Promise<void>((done) => (resolve = done))
  const onStatusChange = jest.fn()
  const { userEvent } = renderWithProviders(
    <OrganizationDomainStatusSummary
      domains={[domain('a.example.com'), domain('b.example.com')]}
      status=""
      onStatusChange={onStatusChange}
    />
  )
  expect(screen.queryByRole('group', { name: 'DNS status on this page' })).not.toBeInTheDocument()

  mockStatuses = new Map([
    ['env:a.example.com', { status: 'failing', details: [] }],
    ['env:b.example.com', { status: 'valid', details: [] }],
  ])
  mockPending = undefined
  await act(async () => resolve())
  await userEvent.click(await screen.findByRole('button', { name: '1 failing' }))
  expect(onStatusChange).toHaveBeenCalledWith('failing')
  expect(screen.getByRole('button', { name: '1 valid' })).toBeInTheDocument()
})
