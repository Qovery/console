import { Wrapper } from '__tests__/utils/providers'
import { renderHook } from '@qovery/shared/util-tests'
import useAuth from './use-auth'

describe('useAuth', () => {
  it('should render successfully', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper })
    expect(result).toBeTruthy()
  })
})
