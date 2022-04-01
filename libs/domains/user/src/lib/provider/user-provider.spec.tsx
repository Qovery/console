import { renderHook } from '@testing-library/react-hooks'
import { useUser } from './user-provider'

describe('User Provider', () => {
  it('should render successfully', () => {
    const { result } = renderHook(() => useUser())

    expect(result).toBeTruthy()
  })
})
