import { useRedirectIfLogged } from './use-redirect-if-logged'
import { renderHook } from '@testing-library/react-hooks'
import { Wrapper } from '__tests__/utils/providers'
import { getRedirectLoginUri } from './utils/utils'

jest.mock('./utils/utils')

const mockedUsedNavigate = jest.fn()
jest.mock('react-router', () => ({
  ...(jest.requireActual('react-router') as any),
  useNavigate: () => mockedUsedNavigate,
}))

describe('UseRedirectIfLogged', () => {
  it('should render successfully', () => {
    const { result } = renderHook(useRedirectIfLogged)
    expect(result).toBeTruthy()
  })

  it('should call navigate', () => {
    getRedirectLoginUri.mockImplementation(() => '/login')
    renderHook(useRedirectIfLogged, { wrapper: Wrapper })
    expect(mockedUsedNavigate).toHaveBeenCalledWith('/login')
  })
})
