import { Wrapper } from '__tests__/utils/providers'
import { type RenderResult, renderHook } from '__tests__/utils/setup-jest'
import useAuth from './use-auth'

describe('useAuth', () => {
  let rendered: { result: RenderResult<ReturnType<typeof useAuth>> }

  beforeEach(() => {
    rendered = renderHook(() => useAuth(), { wrapper: Wrapper })
  })

  it('should render successfully', () => {
    expect(rendered.result).toBeTruthy()
  })
})
