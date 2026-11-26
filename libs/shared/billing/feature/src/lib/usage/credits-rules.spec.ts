// The billing kit's rules for prepaid credits and reactivation (rules.ts), from pricing-api's
// web/tests/credits-reactivation.test.ts.
import { changeBlockedText, creditQuantityError } from '../utils/rules'

const minutes = {
  min: 100,
  max: 500_000,
  step: 100,
  unit: 'minutes',
  annual: { min: 96_000, unit_price: 13, discount_pct: 20 },
}

test('a quantity of credits follows the server: whole, within bounds, in steps', () => {
  expect(creditQuantityError(minutes, 1000)).toBe('')
  expect(creditQuantityError(minutes, 500_000)).toBe('')
  expect(creditQuantityError(minutes, 0)).toMatch(/whole number/)
  expect(creditQuantityError(minutes, -100)).toMatch(/whole number/)
  expect(creditQuantityError(minutes, 10.5)).toMatch(/whole number/)
  expect(creditQuantityError(minutes, Number.NaN)).toMatch(/whole number/)
  expect(creditQuantityError(minutes, 50)).toMatch(/At least 100 minutes/)
  expect(creditQuantityError(minutes, 1050)).toMatch(/steps of 100/)
  expect(creditQuantityError(minutes, 500_100)).toMatch(/At most 500,000 minutes/)
  expect(creditQuantityError(minutes, 10_000, true)).toMatch(/At least 96,000 minutes for a year upfront/)
  expect(creditQuantityError(minutes, 96_000, true)).toBe('')
})

test('what to do when credits cannot be bought or the subscription reactivated here', () => {
  expect(changeBlockedText({ available: true }, 'credits')).toBeNull()
  expect(changeBlockedText({ available: false, code: 'CONTRACT_MANAGED' }, 'credits')?.title).toBe(
    'Prepaid usage is set by your contract'
  )
  expect(changeBlockedText({ available: false, code: 'AWS_MARKETPLACE' }, 'credits')?.body).toMatch(/private offer/)
  expect(changeBlockedText({ available: false, code: 'SELF_SERVE_UNAVAILABLE' }, 'credits')?.title).toBe(
    'Contact us to buy prepaid credits'
  )
  expect(
    changeBlockedText({ available: false, code: 'PAYMENT_METHOD_REQUIRED', detail: 'add a card' }, 'credits')?.contact
  ).toBe(false)
  expect(changeBlockedText({ available: false, code: 'PAYMENT_ACTIONS_UNAVAILABLE' }, 'reactivate')?.body).toMatch(
    /reactivate your subscription/
  )
  expect(changeBlockedText({ available: false, code: 'SELF_SERVE_UNAVAILABLE' }, 'plan')?.title).toBe(
    'Contact us to change your plan'
  )
})
