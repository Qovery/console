import { toShortQoveryId } from './to-short-qovery-id'

describe('toShortQoveryId', () => {
  it('should prefix the first eight id characters with z', () => {
    expect(toShortQoveryId('61d95abd-b777-4f53-b832-58c7e7f6f1bf')).toEqual('z61d95abd')
  })
})
