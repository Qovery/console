import { shortToLongId } from './short-to-long-id'

describe('finding the long id from the short id', () => {
  const listIds = ['f9613eb4-1bfa-4b74-85bc-864e7fb72abd', '61d95abd-b777-4f53-b832-58c7e7f6f1bf']

  it('should use the short id to find the associated long id in the list', () => {
    const shortId = 'z61d95abd'
    const foundId = shortToLongId(shortId, listIds)
    expect(foundId).toEqual('61d95abd-b777-4f53-b832-58c7e7f6f1bf')
  })
})
