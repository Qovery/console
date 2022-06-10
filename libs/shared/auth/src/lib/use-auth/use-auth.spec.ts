import { renderHook, RenderResult } from '@testing-library/react-hooks'
import { Wrapper } from '__tests__/utils/providers'
import useAuth from './use-auth'

describe('useAuth', () => {
  let rendered: { result: RenderResult<ReturnType<typeof useAuth>> }

  beforeEach(() => {
    rendered = renderHook(() => useAuth(), { wrapper: Wrapper })
  })

  it('should render successfully', () => {
    expect(rendered.result).toBeTruthy()
  })

  it('should call the login with popup method', async () => {})

  it('should call the dispatch and logout method', async () => {})

  it('should call the get access token method and dispatch the user infos', async () => {})
})
