import { type OrganizationCustomDomainResponse } from 'qovery-typescript-axios'
import { type PropsWithChildren } from 'react'
import { TablePrimitives } from '@qovery/shared/ui'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { OrganizationDomainRow } from './organization-domain-row'

const mockDelete = jest.fn().mockResolvedValue(undefined)
const mockConfirm = jest.fn()
jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organizationId: 'org-1' }),
}))
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: () => ({ data: 'PRODUCTION' }),
}))
jest.mock('@qovery/domains/custom-domains/feature', () => ({
  useDeleteOrganizationCustomDomain: () => ({ mutateAsync: mockDelete, isLoading: false }),
}))
jest.mock('./organization-domain-status', () => ({
  OrganizationDomainStatusCell: ({ result, checking }: { result?: { status: string }; checking?: boolean }) => (
    <span>Status: {checking ? 'checking' : result?.status ?? 'loading'}</span>
  ),
}))
jest.mock('@qovery/shared/ui', () => ({
  ...jest.requireActual('@qovery/shared/ui'),
  Link: ({
    children,
    className,
    title,
    ...props
  }: PropsWithChildren<{ className?: string; title?: string; 'aria-label'?: string }>) => (
    <a href="/organization" className={className} title={title} aria-label={props['aria-label']}>
      {children}
    </a>
  ),
  useModalConfirmation: () => ({ openModalConfirmation: mockConfirm }),
}))
const domain: OrganizationCustomDomainResponse = {
  domain: 'app.example.com',
  environment_id: 'env',
  project: { id: 'project', name: 'Project' },
  environment: { id: 'env', name: 'production', routing_mode: 'PER_HOSTNAME_LISTENER_SET' },
  generate_certificate: true,
  use_cdn: false,
  routes: [
    {
      id: 'route-1',
      custom_domain_id: 'domain-1',
      service: { id: 'app-1', name: 'web', type: 'APPLICATION' },
      port: null,
      path: '/',
      path_rewrite: null,
    },
  ],
}
const { Table } = TablePrimitives
function renderRow(value = domain) {
  return renderWithProviders(
    <Table.Root>
      <Table.Body>
        <OrganizationDomainRow domain={value} />
      </Table.Body>
    </Table.Root>
  )
}
beforeEach(() => jest.clearAllMocks())

it('renders a route without a public port', () => {
  const { baseElement } = renderRow()
  expect(baseElement).toMatchSnapshot()
  expect(screen.getByText('web')).toBeInTheDocument()
  expect(screen.getByText('/')).toBeInTheDocument()
})

it('requires confirmation and deletes the domain from its environment', async () => {
  const route = domain.routes[0]
  const { userEvent } = renderRow({ ...domain, routes: [route, { ...route, id: 'route-2', path: '/api' }] })
  await userEvent.click(screen.getByRole('button', { name: 'Delete app.example.com' }))
  expect(mockDelete).not.toHaveBeenCalled()
  await mockConfirm.mock.calls[0][0].action()
  expect(mockDelete).toHaveBeenCalledTimes(1)
  expect(mockDelete).toHaveBeenCalledWith({ environmentId: 'env', domainName: 'app.example.com' })
})

it('renders the DNS status cell and rechecks on demand', async () => {
  const onCheckDns = jest.fn()
  const { userEvent } = renderWithProviders(
    <Table.Root>
      <Table.Body>
        <OrganizationDomainRow domain={domain} dnsStatus={{ status: 'failing', details: [] }} onCheckDns={onCheckDns} />
      </Table.Body>
    </Table.Root>
  )
  expect(screen.getByText('Status: failing')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Check DNS for app.example.com' }))
  expect(onCheckDns).toHaveBeenCalled()
})

it('disables the DNS check while it runs', () => {
  renderWithProviders(
    <Table.Root>
      <Table.Body>
        <OrganizationDomainRow domain={domain} dnsChecking onCheckDns={jest.fn()} />
      </Table.Body>
    </Table.Root>
  )
  expect(screen.getByRole('button', { name: 'Check DNS for app.example.com' })).toBeDisabled()
})

it('renders a controlled row checkbox and reports changes', async () => {
  const onSelectionChange = jest.fn()
  const { userEvent } = renderWithProviders(
    <Table.Root>
      <Table.Body>
        <OrganizationDomainRow domain={domain} selected onSelectionChange={onSelectionChange} />
      </Table.Body>
    </Table.Root>
  )
  const checkbox = screen.getByRole('checkbox', { name: 'Select app.example.com in production' })
  expect(checkbox).toBeChecked()
  await userEvent.click(checkbox)
  expect(onSelectionChange).toHaveBeenCalledWith(false)
})

it('uses a single circular external-link action and renders the actual environment mode', () => {
  renderRow()
  const external = screen.getByRole('link', { name: 'Open app.example.com' })
  expect(external).toHaveAttribute('href', 'https://app.example.com')
  expect(external.querySelectorAll('i')).toHaveLength(1)
  expect(external).toHaveClass('rounded-full')
  expect(screen.getByLabelText('production environment')).toHaveTextContent('P')
})
it('renders compact neutral route chips and preserves full long names', () => {
  const longDomain = {
    ...domain,
    domain: 'a-very-long-domain-name.example.com',
    project: { ...domain.project, name: 'A very long project name' },
  }
  renderRow(longDomain)
  expect(screen.getByTitle(longDomain.domain)).toHaveTextContent(longDomain.domain)
  expect(screen.getByTitle(longDomain.project.name)).toHaveClass('font-normal')
  const route = screen.getByRole('link', { name: 'web: /' })
  expect(route).toHaveClass('gap-0', 'text-xs')
  expect(route.querySelector('svg')).toBeInTheDocument()
  expect(route.querySelector('img')).not.toBeInTheDocument()
})
