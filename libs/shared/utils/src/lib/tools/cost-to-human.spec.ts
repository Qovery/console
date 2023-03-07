import { costToHuman } from './cost-to-human'

describe('costToHuman', () => {
  it('should return a string with $ and numbers split into three separated per comma', () => {
    expect(costToHuman(1000, 'USD')).toEqual('$1,000')
  })

  it('should return a string with € and numbers split into three separated per comma', () => {
    expect(costToHuman(10000, 'EUR')).toEqual('€10,000')
  })

  it('should return a string with £ and a unique number', () => {
    expect(costToHuman(1, 'GBP')).toEqual('£1')
  })
})
