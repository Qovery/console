import { convertMemory } from './convert-memory-size'

describe('test convert memory GB and MB', () => {
  it('should convert memory GB to MB', () => {
    expect(convertMemory(10, 'GB')).toEqual(10240)
  })
  it('should convert memory MB to GB', () => {
    expect(convertMemory(2048, 'MB')).toEqual(2)
  })
})
