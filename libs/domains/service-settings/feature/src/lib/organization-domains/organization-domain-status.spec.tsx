import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { OrganizationDomainStatusCell, OrganizationDomainStatusSummary } from './organization-domain-status'

it('shows a skeleton while the checks load, then the badge only', () => {
  const { container, rerender } = renderWithProviders(<OrganizationDomainStatusCell />)
  expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument()
  expect(screen.queryByText('Unknown')).not.toBeInTheDocument()

  rerender(<OrganizationDomainStatusCell result={{ status: 'valid', details: [] }} />)
  expect(screen.getByText('Valid')).toBeInTheDocument()
  expect(container.querySelector('[aria-busy="true"]')).not.toBeInTheDocument()
})

it('shows a skeleton while the status is rechecked', () => {
  const { container } = renderWithProviders(
    <OrganizationDomainStatusCell result={{ status: 'failing', details: ['Wrong host'] }} checking />
  )
  expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument()
  expect(screen.queryByText('Failing')).not.toBeInTheDocument()
})

it('explains an unknown status when the check could not run', async () => {
  const { userEvent } = renderWithProviders(
    <OrganizationDomainStatusCell result={{ status: 'unknown', details: ['The cluster is unreachable.'] }} />
  )
  await userEvent.hover(screen.getByText('Unknown'))
  expect(await screen.findByRole('tooltip')).toHaveTextContent('The cluster is unreachable.')
})

it('keeps the summary as a skeleton until the checks load', async () => {
  const onStatusChange = jest.fn()
  const { rerender, userEvent } = renderWithProviders(
    <OrganizationDomainStatusSummary status="" onStatusChange={onStatusChange} />
  )
  expect(screen.queryByRole('group', { name: 'DNS status on this page' })).not.toBeInTheDocument()

  rerender(
    <OrganizationDomainStatusSummary
      counts={
        new Map([
          ['failing', 1],
          ['valid', 1],
        ])
      }
      status=""
      onStatusChange={onStatusChange}
    />
  )
  await userEvent.click(screen.getByRole('button', { name: '1 failing' }))
  expect(onStatusChange).toHaveBeenCalledWith('failing')
  expect(screen.getByRole('button', { name: '1 valid' })).toBeInTheDocument()
})
