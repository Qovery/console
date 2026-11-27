import type { Cancellation } from 'qovery-pricing-typescript-axios'
import type { PricingClient } from '@qovery/shared/billing/data-access'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { CancelDialog } from './cancel'

it('allows cancellation with one explicit confirmation and no required feedback', async () => {
  const cancel = jest.fn().mockResolvedValue({ status: 'cancelled' })
  const client = { mode: 'live', cancel } as unknown as PricingClient
  const view: Cancellation = {
    organization_name: 'Northwind',
    mode: 'cancel',
    unavailable: null,
    billing_channel: 'chargebee',
    term_end: '2026-12-01',
    ends_on: '2026-12-01',
    notice_days: 0,
    notice_deadline: null,
    support_days: 0,
    support_until: '',
    after_end: [],
    reasons: [{ code: 'other', label: 'Something else' }],
    current: null,
  }
  const onDone = jest.fn()
  const onClose = jest.fn()
  const { userEvent } = renderWithProviders(
    <CancelDialog organizationId="org-a" client={client} view={view} onDone={onDone} onClose={onClose} />
  )
  expect(cancel).not.toHaveBeenCalled()
  expect(screen.queryByLabelText(/Type .* to confirm/)).not.toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Cancel subscription', exact: true }))
  expect(cancel).toHaveBeenCalledWith('org-a', { confirm: 'Northwind', reason: 'other', feedback: undefined })
  expect(onDone).toHaveBeenCalled()
  expect(onClose).toHaveBeenCalled()
})
