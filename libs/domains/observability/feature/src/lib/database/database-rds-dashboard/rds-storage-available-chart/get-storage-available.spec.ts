import { getStorageAvailable } from './get-storage-available'

describe('getStorageAvailable', () => {
  const freeBytes = String(25 * 1024 * 1024 * 1024)

  it('returns a percentage when total storage is known', () => {
    expect(getStorageAvailable(freeBytes, 100)).toBe(25)
  })

  it('returns free GiB when a blueprint does not expose total storage', () => {
    expect(getStorageAvailable(freeBytes)).toBe(25)
    expect(getStorageAvailable(freeBytes, 0)).toBe(25)
  })
})
