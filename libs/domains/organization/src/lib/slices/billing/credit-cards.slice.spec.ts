import { creditCardsAdapter, creditCardsReducer } from './credit-cards.slice'

describe('Credit Card Reducer', () => {
  it('should handle initial state', () => {
    const expected = creditCardsAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
      joinCreditCardsOrganization: {},
    })

    expect(creditCardsReducer(undefined, { type: '' })).toEqual(expected)
  })
})
