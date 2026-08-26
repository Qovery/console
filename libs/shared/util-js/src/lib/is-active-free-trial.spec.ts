import { isActiveFreeTrial } from './is-active-free-trial'

describe('isActiveFreeTrial', () => {
  it('should return false when remainingTrialDay is undefined', () => {
    expect(isActiveFreeTrial(undefined)).toBe(false)
  })

  it('should return false when remainingTrialDay is 0 or negative', () => {
    expect(isActiveFreeTrial(0)).toBe(false)
    expect(isActiveFreeTrial(-1)).toBe(false)
  })

  it('should return true when remainingTrialDay is within the trial window', () => {
    expect(isActiveFreeTrial(1)).toBe(true)
    expect(isActiveFreeTrial(14)).toBe(true)
    expect(isActiveFreeTrial(90)).toBe(true)
  })

  it('should return false when remainingTrialDay exceeds the trial window', () => {
    expect(isActiveFreeTrial(91)).toBe(false)
  })
})
