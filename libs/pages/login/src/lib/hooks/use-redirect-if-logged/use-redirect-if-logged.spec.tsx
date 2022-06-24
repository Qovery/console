import { useRedirectIfLogged } from './use-redirect-if-logged'
import { renderHook } from '@testing-library/react-hooks'

describe('UseRedirectIfLogged', () => {
  it('should render successfully', () => {
    const { result } = renderHook(useRedirectIfLogged)
    expect(result).toBeTruthy()
  })
})
