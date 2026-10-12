import { getPresentationState } from './get-presentation-state'

it('distinguishes loading, unavailable sentinels and available data', () => {
  expect(getPresentationState(undefined)).toEqual({ status: 'loading', data: undefined })
  expect(getPresentationState(null)).toEqual({ status: 'unavailable', data: null })
  expect(getPresentationState('NotFound')).toEqual({ status: 'unavailable', data: null })
  const data = { nodes: [] }
  expect(getPresentationState(data)).toEqual({ status: 'available', data })
})
