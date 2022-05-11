import { renderHook } from '@testing-library/react-hooks'
import { useEnvironments } from './environments-provider'

describe('Environments Provider', () => {
  it('should render successfully', () => {
    const { result } = renderHook(() => useEnvironments())

    expect(result).toBeTruthy()
  })
})
