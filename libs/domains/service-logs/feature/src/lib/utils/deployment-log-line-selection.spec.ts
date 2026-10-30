import {
  formatDeploymentLogLineHash,
  getNextDeploymentLogLineRange,
  isDeploymentLogLineSelected,
  parseDeploymentLogLineHash,
} from './deployment-log-line-selection'

describe('parseDeploymentLogLineHash', () => {
  it.each([
    ['#L12', { start: 12, end: 12 }],
    ['L12-L20', { start: 12, end: 20 }],
    ['#L20-L12', { start: 12, end: 20 }],
  ])('reads %s', (hash, range) => {
    expect(parseDeploymentLogLineHash(hash)).toEqual(range)
  })

  it.each(['', '#12', '#L', '#L12-20', '#section'])('ignores %s', (hash) => {
    expect(parseDeploymentLogLineHash(hash)).toBeUndefined()
  })
})

describe('formatDeploymentLogLineHash', () => {
  it('writes a line or a range', () => {
    expect(formatDeploymentLogLineHash({ start: 12, end: 12 })).toBe('L12')
    expect(formatDeploymentLogLineHash({ start: 12, end: 20 })).toBe('L12-L20')
  })
})

describe('isDeploymentLogLineSelected', () => {
  it('tells whether the line is in the range', () => {
    expect(isDeploymentLogLineSelected({ start: 12, end: 20 }, 15)).toBe(true)
    expect(isDeploymentLogLineSelected({ start: 12, end: 20 }, 21)).toBe(false)
    expect(isDeploymentLogLineSelected(undefined, 15)).toBe(false)
  })
})

describe('getNextDeploymentLogLineRange', () => {
  it('selects the clicked line', () => {
    expect(getNextDeploymentLogLineRange(undefined, 12, false)).toEqual({ start: 12, end: 12 })
    expect(getNextDeploymentLogLineRange({ start: 3, end: 8 }, 12, false)).toEqual({ start: 12, end: 12 })
  })

  it('extends the selection from its start with shift', () => {
    expect(getNextDeploymentLogLineRange({ start: 12, end: 12 }, 20, true)).toEqual({ start: 12, end: 20 })
    expect(getNextDeploymentLogLineRange({ start: 12, end: 20 }, 5, true)).toEqual({ start: 5, end: 12 })
    expect(getNextDeploymentLogLineRange(undefined, 20, true)).toEqual({ start: 20, end: 20 })
  })

  it('clears the selection when clicking its only line', () => {
    expect(getNextDeploymentLogLineRange({ start: 12, end: 12 }, 12, false)).toBeUndefined()
  })
})
