import { ServiceTypeEnum } from '@qovery/shared/enums'
import { formatData, handleSubmit } from './handle-submit'

describe('handleSubmit()', () => {
  it('should format the data correctly', () => {
    const data = {
      key_key: 'key',
      key_value: 'value',
      key_scope: 'application',
      key_secret: 'false',
      key2_key: 'key',
      key2_value: 'value',
      key2_scope: 'built_in',
      key2_secret: 'true',
    }
    const keys = ['key', 'key2']
    const result = formatData(data, keys)
    expect(result).toEqual([
      {
        name: 'key',
        value: 'value',
        scope: 'application',
        is_secret: false,
      },
      {
        name: 'key',
        value: 'value',
        scope: 'built_in',
        is_secret: true,
      },
    ])
  })

  it('should dispatch the correct action', async () => {
    const dispatch = jest.fn().mockImplementation(() => Promise.resolve())
    const modalClose = jest.fn()
    const applicationId = '123'
    const data = {
      key_key: 'key',
      key_value: 'value',
      key_scope: 'application',
      key_is_secret: 'false',
      key2_key: 'key',
      key2_value: 'value',
      key2_scope: 'built_in',
      key2_is_secret: 'true',
    }
    const keys = ['key', 'key2']
    await handleSubmit(data, applicationId, keys, dispatch, modalClose, false, ServiceTypeEnum.APPLICATION)
    // called three times: one to dispatch the import and two times to fetch secrets and env variables
    expect(dispatch).toHaveBeenCalledTimes(3)
    expect(modalClose).toHaveBeenCalledWith()
  })
})
